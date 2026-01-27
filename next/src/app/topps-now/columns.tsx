"use client";

import { MouseEvent } from "react";
import { Box, Typography, Link } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import type { Team, ToppsCard } from "@/lib/types";

export function getColumns(editMode: boolean, teams: Team[]): GridColDef[] {
  const sortCardNumber = (a: string, b: string) => {
    const isSpecialA = a.startsWith('TS-') || a.startsWith('SP-');
    const isSpecialB = b.startsWith('TS-') || b.startsWith('SP-');

    if (isSpecialA && !isSpecialB) return 1;
    if (!isSpecialA && isSpecialB) return -1;

    if (isSpecialA && isSpecialB) {
      return a.localeCompare(b);
    }

    const parseCardNumber = (str: string) => {
      const numOnly = str.match(/^(\d+)$/);
      if (numOnly) {
        return { prefix: '', num: parseInt(numOnly[1]) };
      }

      const withDash = str.match(/^([A-Z]+)-(\d+)$/);
      if (withDash) {
        return { prefix: withDash[1], num: parseInt(withDash[2]) };
      }

      const alphaOnly = str.match(/^([A-Z]+)$/);
      if (alphaOnly) {
        return { prefix: alphaOnly[1], num: undefined };
      }

      return { prefix: str, num: undefined };
    };

    const parsedA = parseCardNumber(a);
    const parsedB = parseCardNumber(b);

    if (parsedA.prefix !== parsedB.prefix) {
      return parsedA.prefix.localeCompare(parsedB.prefix);
    }

    if (parsedA.num !== undefined && parsedB.num !== undefined) {
      return parsedA.num - parsedB.num;
    }

    if (parsedA.num !== undefined) return 1;
    if (parsedB.num !== undefined) return -1;

    return a.localeCompare(b);
  };

  return [
    {
      field: 'card_number',
      headerName: 'カード番号',
      width: 130,
      headerClassName: 'data-grid-header',
      sortComparator: sortCardNumber,
      filterable: true,
      renderCell: (params) => {
        const shortUrl = params.row.product_url;
        const longUrl = params.row.product_url_long;
        const linkUrl = shortUrl || longUrl;

        if (linkUrl) {
          return (
            <Link
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#1a472a',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#2e7d32',
                },
              }}
            >
              {params.value}
            </Link>
          );
        }
        return params.value;
      },
    },
    {
      field: 'release_date',
      headerName: '発行日',
      width: 140,
      headerClassName: 'data-grid-header',
      editable: editMode,
      type: 'date',
      valueGetter: (value: string | null) => {
        if (!value) return null;
        return new Date(value);
      },
      valueSetter: (value: Date | string | null, row: ToppsCard) => {
        if (value instanceof Date) {
          return { ...row, release_date: value.toISOString().split('T')[0] };
        }
        return { ...row, release_date: value };
      },
      renderCell: (params: { row: ToppsCard }) => {
        const releaseDate = params.row.release_date;
        if (!releaseDate) return '-';

        const date = new Date(releaseDate);
        const formattedDate = date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

        if (editMode) {
          return formattedDate;
        }

        const mlbGameId = params.row.mlb_game_id;
        if (mlbGameId) {
          return (
            <Link
              href={`https://www.mlb.com/gameday/${mlbGameId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#1a472a',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#2e7d32',
                },
              }}
            >
              {formattedDate}
            </Link>
          );
        }

        const gameDate = new Date(date);
        gameDate.setDate(gameDate.getDate() - 1);
        const gameDateStr = gameDate.toISOString().split('T')[0];

        const team = params.row.team;

        const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();

          if (team?.mlb_team_id) {
            try {
              const response = await fetch(`/api/mlb/game/?team_id=${team.mlb_team_id}&date=${gameDateStr}`);
              if (response.ok) {
                const data = await response.json();
                if (data.game_url) {
                  window.open(data.game_url, '_blank', 'noopener,noreferrer');
                  return;
                }
              }
            } catch {
              // Fallback to team schedule page
            }
          }

          if (team?.nickname) {
            const teamSlug = team.nickname.toLowerCase().replace(/\s+/g, '-');
            window.open(`https://www.mlb.com/${teamSlug}/schedule/${gameDateStr}`, '_blank', 'noopener,noreferrer');
          } else {
            window.open(`https://www.mlb.com/scores/${gameDateStr}`, '_blank', 'noopener,noreferrer');
          }
        };

        return (
          <Link
            href="#"
            onClick={handleClick}
            sx={{
              color: '#1a472a',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
                color: '#2e7d32',
              },
            }}
          >
            {formattedDate}
          </Link>
        );
      },
      filterable: true,
      sortable: true,
    },
    {
      field: 'total_print',
      headerName: '発行枚数',
      width: 130,
      type: 'number',
      headerClassName: 'data-grid-header',
      editable: editMode,
      valueFormatter: (value: number | null) => value ? value.toLocaleString() : '-',
      filterable: true,
    },
    {
      field: 'player',
      headerName: '選手名',
      width: 200,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => row.player?.full_name || 'Team Set',
      filterable: true,
      renderCell: (params: { row: ToppsCard }) => {
        const player = params.row.player;
        if (player && player.mlb_player_id) {
          return (
            <Link
              href={`/players/${player.id}`}
              sx={{
                color: '#1a472a',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#2e7d32',
                },
              }}
            >
              {player.full_name}
            </Link>
          );
        }
        return player?.full_name || 'Team Set';
      },
    },
    {
      field: 'team',
      headerName: 'チーム',
      width: 180,
      headerClassName: 'data-grid-header',
      editable: editMode,
      type: editMode ? 'singleSelect' : undefined,
      valueOptions: editMode ? [
        { value: '', label: '-' },
        ...teams.map((t: Team) => ({ value: t.id, label: t.full_name }))
      ] : undefined,
      valueGetter: (_value: unknown, row: ToppsCard) => {
        if (editMode) {
          return row.team?.id || '';
        }
        return row.team?.full_name || '-';
      },
      valueSetter: (value: number | string | null, row: ToppsCard) => {
        if (value === '' || value === null) {
          return { ...row, team: null };
        }
        const selectedTeam = teams.find((t: Team) => t.id === value);
        return { ...row, team: selectedTeam || null };
      },
      renderCell: (params: { row: ToppsCard }) => {
        return params.row.team?.full_name || '-';
      },
      filterable: true,
    },
    ...(editMode ? [
      {
        field: 'product_url',
        headerName: '商品URL',
        width: 200,
        headerClassName: 'data-grid-header',
        editable: true,
        filterable: false,
      },
      {
        field: 'product_url_long',
        headerName: '商品URL (長)',
        width: 200,
        headerClassName: 'data-grid-header',
        editable: true,
        filterable: false,
      },
    ] as GridColDef[] : []),
    {
      field: 'created_at',
      headerName: '作成日',
      width: 120,
      headerClassName: 'data-grid-header',
      type: 'date',
      valueGetter: (value: string | null) => {
        if (!value) return null;
        return new Date(value);
      },
      renderCell: (params: { row: ToppsCard }) => {
        const createdAt = params.row.created_at;
        if (!createdAt) return '-';
        const date = new Date(createdAt);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
      filterable: true,
      sortable: true,
    },
    {
      field: 'nationality',
      headerName: '国籍',
      width: 100,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => row.player?.nationality || '-',
      filterable: true,
    },
    {
      field: 'wbc',
      headerName: 'WBC',
      width: 160,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => {
        if (!row.player?.wbc_years) return '';
        return `${row.player.wbc_country} (${row.player.wbc_years})`;
      },
      filterable: true,
      renderCell: (params: { row: ToppsCard }) => {
        const player = params.row.player;
        if (!player?.wbc_years) return '-';
        return (
          <Box sx={{ lineHeight: 1.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
              {player.wbc_country}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {player.wbc_years}
            </Typography>
          </Box>
        );
      },
    },
  ];
}

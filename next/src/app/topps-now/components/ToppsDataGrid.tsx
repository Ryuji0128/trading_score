"use client";

import { Box, Typography, Paper, CircularProgress, Switch, FormControlLabel } from "@mui/material";
import { DataGrid, GridToolbar, useGridApiRef, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import type { ToppsCard } from "@/lib/types";

interface ToppsDataGridProps {
  toppsCards: ToppsCard[];
  columns: GridColDef[];
  loading: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  isSuperuser: boolean;
  onProcessRowUpdate: (newRow: ToppsCard, oldRow: ToppsCard) => Promise<ToppsCard>;
  onProcessRowUpdateError: (error: Error) => void;
  onFilteredRowCountChange: (count: number | null) => void;
  filteredRowCount: number | null;
}

export default function ToppsDataGrid({
  toppsCards,
  columns,
  loading,
  editMode,
  setEditMode,
  isSuperuser,
  onProcessRowUpdate,
  onProcessRowUpdateError,
  onFilteredRowCountChange,
  filteredRowCount,
}: ToppsDataGridProps) {
  const apiRef = useGridApiRef();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            カード一覧
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filteredRowCount !== null && filteredRowCount !== toppsCards.length
              ? `${filteredRowCount}件 / 全${toppsCards.length}件のカードデータ`
              : `全${toppsCards.length}件のカードデータ`}
          </Typography>
        </Box>
        {isSuperuser && (
          <FormControlLabel
            control={
              <Switch
                checked={editMode}
                onChange={(e) => setEditMode(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2e7d32',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#2e7d32',
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EditIcon fontSize="small" />
                編集モード
              </Box>
            }
            sx={{
              bgcolor: editMode ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              border: editMode ? '1px solid #2e7d32' : '1px solid transparent',
            }}
          />
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#2e7d32' }} />
        </Box>
      ) : toppsCards.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            height: 700,
            width: '100%',
            borderRadius: 3,
            border: '1px solid #e8f5e9',
            '& .data-grid-header': {
              backgroundColor: '#f1f8f4',
              color: '#1a472a',
              fontWeight: 700,
            },
            '& .MuiDataGrid-root': {
              border: 'none',
            },
          }}
        >
          <DataGrid
            apiRef={apiRef}
            rows={toppsCards}
            columns={columns}
            editMode="cell"
            processRowUpdate={onProcessRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
            onFilterModelChange={() => {
              setTimeout(() => {
                const filteredRows = apiRef.current?.getRowModels?.();
                if (filteredRows) {
                  let count = 0;
                  const lookup = apiRef.current?.state?.filter?.filteredRowsLookup;
                  if (lookup) {
                    count = Object.values(lookup).filter(v => v).length;
                  } else {
                    count = filteredRows.size;
                  }
                  onFilteredRowCountChange(count);
                }
              }, 50);
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: 'card_number', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: {
                  debounceMs: 500,
                },
              },
            }}
            disableRowSelectionOnClick
            disableColumnFilter={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f8fdf9',
              },
              '& .MuiDataGrid-cell--editing': {
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
              },
            }}
          />
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            カードデータがありません
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            スクレイピングコマンドを実行してカードデータを取得してください
          </Typography>
        </Box>
      )}
    </Box>
  );
}

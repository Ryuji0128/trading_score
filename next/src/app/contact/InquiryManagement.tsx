"use client";

import {
  Box,
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { Session } from "next-auth";
import { useCallback, useEffect, useState } from "react";

interface Inquiry {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  inquiry: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

interface InquiryManagementProps {
  session: Session;
}

const InquiryManagement: React.FC<InquiryManagementProps> = ({ session }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width:${theme.breakpoints.values.sm}px)`);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(inquiries.length / ITEMS_PER_PAGE);
  const paginatedData = inquiries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 問い合わせ一覧を取得
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await axios.get<{ inquiries: Inquiry[] }>("/api/email");
      setInquiries(response.data.inquiries);
    } catch (error) {
      console.error("問い合わせ一覧の取得に失敗:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (session) {
      const fetchUser = async () => {
        try {
          const response = await axios.get<{ users: User[] }>(
            `/api/user?email=${encodeURIComponent(session?.user?.email ?? "")}`
          );
          setUser(response.data.users[0]);
        } catch (error) {
          console.error("ユーザー情報の取得に失敗:", error);
        }
      };
      fetchUser();
    }
  }, [session]);

  // 問い合わせの削除
  const deleteInquiry = async () => {
    if (!inquiryToDelete) return;

    try {
      await axios.delete("/api/email", {
        data: { id: inquiryToDelete },
      });
      setDeleteModalOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error("問い合わせの削除に失敗:", error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePagination = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const paginationItems = generatePagination();

  return (
    <Box sx={{ maxWidth: "1000px", margin: "0 auto", padding: 2 }}>
      {/* ページネーション：テーブル前 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <Button
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          前へ
        </Button>
        <Typography sx={{ fontSize: { xs: "12px", md: "14px" }, alignSelf: "center" }}>
          {currentPage} / {totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          次へ
        </Button>
      </Box>

      {loading ? (
        <Typography>読み込み中...</Typography>
      ) : inquiries.length === 0 ? (
        <Typography>問い合わせはありません。</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: "600px" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "120px", textAlign: "center" }}>
                  日付
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontWeight: "bold", width: "80px", textAlign: "center" }}>
                    時間
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold", width: "140px", textAlign: "center" }}>
                  氏名
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontWeight: "bold", width: "220px", textAlign: "center" }}>
                    メールアドレス
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ fontWeight: "bold", width: "150px", textAlign: "center" }}>
                    電話番号
                  </TableCell>
                )}
                {user?.role === "ADMIN" && (
                  <TableCell sx={{ fontWeight: "bold", width: "160px", textAlign: "center" }}>
                    操作
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell sx={{ textAlign: "center" }}>
                    {isMobile ? (
                      <>
                        <Typography variant="body2">
                          {dayjs(inquiry.createdAt).format("YYYY年")}
                        </Typography>
                        <Typography variant="body2">
                          {dayjs(inquiry.createdAt).format("MM月DD日")}
                        </Typography>
                      </>
                    ) : (
                      dayjs(inquiry.createdAt).format("YYYY/MM/DD")
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ textAlign: "center" }}>
                      {dayjs(inquiry.createdAt).format("HH:mm")}
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      maxWidth: "140px",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                    }}
                  >
                    {inquiry.name}
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        maxWidth: "220px",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {inquiry.email}
                    </TableCell>
                  )}
                  {!isMobile && <TableCell sx={{ textAlign: "center" }}>{inquiry.phone}</TableCell>}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setDetailModalOpen(true);
                      }}
                      sx={{ m: "2px" }}
                    >
                      詳細
                    </Button>
                    {user?.role === "ADMIN" && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setInquiryToDelete(inquiry.id);
                          setDeleteModalOpen(true);
                        }}
                        sx={{ m: "2px" }}
                      >
                        削除
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ページネーション：テーブル後ろ */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            marginTop: 4,
            position: "relative",
          }}
        >
          <Box sx={{ position: "absolute", left: 0 }}>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              最初
            </Button>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              sx={{ marginLeft: 1 }}
            >
              前へ
            </Button>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            {paginationItems.map((item, index) =>
              item === "..." ? (
                <Box key={index} sx={{ padding: "0 8px", color: "text.secondary" }}>
                  ...
                </Box>
              ) : (
                <Button
                  key={index}
                  variant={item === currentPage ? "contained" : "outlined"}
                  onClick={() => handlePageChange(item as number)}
                  sx={{ minWidth: "40px" }}
                >
                  {item}
                </Button>
              )
            )}
          </Box>

          <Box sx={{ position: "absolute", right: 0 }}>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              sx={{ marginRight: 1 }}
            >
              次へ
            </Button>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              最後
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ marginBottom: "300px" }} />

      {/* 削除確認モーダル */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            backgroundColor: "white",
            padding: 3,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography>本当に削除してよろしいですか？</Typography>
          <Button color="error" onClick={deleteInquiry} sx={{ marginTop: 2 }}>
            削除
          </Button>
          <Button onClick={() => setDeleteModalOpen(false)} sx={{ marginTop: 2 }}>
            キャンセル
          </Button>
        </Box>
      </Modal>
      {/* 詳細モーダル */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "500px",
            backgroundColor: "white",
            padding: 3,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            問い合わせ詳細
          </Typography>
          {selectedInquiry && (
            <>
              <Typography>
                <strong>日付:</strong> {dayjs(selectedInquiry.createdAt).format("YYYY/MM/DD HH:mm")}
              </Typography>
              <Typography>
                <strong>氏名:</strong> {selectedInquiry.name}
              </Typography>
              <Typography>
                <strong>メールアドレス:</strong> {selectedInquiry.email}
              </Typography>
              <Typography>
                <strong>電話番号:</strong> {selectedInquiry.phone}
              </Typography>
              <Typography sx={{ marginTop: 2 }}>
                <strong>お問い合わせ内容:</strong>
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>
                {selectedInquiry.inquiry}
              </Typography>
              <Button onClick={() => setDetailModalOpen(false)} sx={{ marginTop: 2 }}>
                閉じる
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default InquiryManagement;

"use client";

import BaseContainer from "@/components/BaseContainer";
import { CheckCircle, Error } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Typography
} from "@mui/material";
import { useCallback, useRef, useState } from "react";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * ContactForm
 * お問い合わせフォーム
 */
export default function ContactForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<
    "loading" | "success" | "error"
  >("loading");

  // モーダルを閉じる
  const closeModal = () => setIsModalOpen(false);

  // 入力中にエラーをクリア
  const handleChange = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // バリデーション
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!nameRef.current?.value?.trim()) {
      newErrors.name = "お名前を入力してください";
    }
    if (!emailRef.current?.value?.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRef.current.value)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }
    if (!subjectRef.current?.value?.trim()) {
      newErrors.subject = "件名を入力してください";
    }
    if (!messageRef.current?.value?.trim()) {
      newErrors.message = "お問い合わせ内容を入力してください";
    }

    return newErrors;
  };

  // フォーム送信
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // 入力チェック
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsModalOpen(true);
    setModalContent("loading");

    try {
      const response = await fetch("/api/contacts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameRef.current?.value || "",
          email: emailRef.current?.value || "",
          subject: subjectRef.current?.value || "",
          message: messageRef.current?.value || "",
        }),
      });

      if (response.ok) {
        setModalContent("success");

        // フォーム初期化
        if (nameRef.current) nameRef.current.value = "";
        if (emailRef.current) emailRef.current.value = "";
        if (subjectRef.current) subjectRef.current.value = "";
        if (messageRef.current) messageRef.current.value = "";
      } else {
        setModalContent("error");
      }
    } catch {
      setModalContent("error");
    }
  }, []);

  return (
    <BaseContainer>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 600,
          margin: "auto",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          align="justify"
          paddingY={5}
          sx={{ textAlign: "justify", textJustify: "inter-word" }}
        >
          下記の送信フォームよりお問い合わせ可能です。<br />
          ご質問・ご要望がある方はお気軽にお問い合わせください。
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginBottom: "20px",
          }}
        >
          <TextField
            inputRef={nameRef}
            label="お名前"
            name="name"
            required
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={() => handleChange("name")}
            fullWidth
          />
          <TextField
            inputRef={emailRef}
            label="メールアドレス"
            name="email"
            type="email"
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
            onChange={() => handleChange("email")}
            fullWidth
          />
          <TextField
            inputRef={subjectRef}
            label="件名"
            name="subject"
            required
            error={Boolean(errors.subject)}
            helperText={errors.subject}
            onChange={() => handleChange("subject")}
            fullWidth
          />
          <TextField
            inputRef={messageRef}
            label="お問い合わせ内容"
            name="message"
            required
            error={Boolean(errors.message)}
            helperText={errors.message}
            onChange={() => handleChange("message")}
            fullWidth
            multiline
            rows={5}
          />
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
        >
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              width: "200px",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            送信
          </Button>
        </Box>
      </Box>

      {/* モーダル */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            borderRadius: "10px",
          }}
        >
          {modalContent === "loading" && (
            <>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>お問い合わせ送信中...</Typography>
            </>
          )}
          {modalContent === "success" && (
            <>
              <CheckCircle sx={{ color: "green", fontSize: 50 }} />
              <Typography sx={{ mt: 2 }}>
                送信が完了しました。お問い合わせいただき、ありがとうございます。
              </Typography>
              <Button onClick={closeModal} sx={{ mt: 2 }} variant="contained">
                閉じる
              </Button>
            </>
          )}
          {modalContent === "error" && (
            <>
              <Error sx={{ color: "red", fontSize: 50 }} />
              <Typography sx={{ mt: 2, color: "red" }}>
                送信に失敗しました。ウェブサイト管理者にお問い合わせください。
              </Typography>
              <Button onClick={closeModal} sx={{ mt: 2 }} variant="contained">
                閉じる
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </BaseContainer>
  );
}

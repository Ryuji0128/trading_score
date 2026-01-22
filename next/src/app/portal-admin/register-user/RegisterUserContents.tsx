"use client";

import React, { useState, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import axios from "axios";
import BaseContainer from "@/components/BaseContainer";
import { RegistrationSchema } from "@/lib/validation";

interface User {
  id: number;
  name: string;
  email: string;
  provider: string | null;
  image: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER"; // ENUM に対応
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterUserContents() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("VIEWER"); // デフォルト値
  const [errors, setErrors] = useState<FormErrors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width:${theme.breakpoints.values.sm}px)`);

  // 入力時のエラー解消
  const handleChange = (field: keyof FormErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined, // 該当フィールドのエラーをクリア
    }));
  };

  // ユーザー一覧の取得
  const fetchUsers = async () => {
    try {
      const response = await axios.get<{
        users: User[];
      }>("/api/user");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  // ユーザーの追加
  const handleAddUser = async () => {
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const validationResult = RegistrationSchema.safeParse({
      name,
      email,
      password,
    });
    if (!validationResult.success) {
      console.error(validationResult);
      setErrors(
        validationResult.error.errors.reduce(
          (acc, error) => ({
            ...acc,
            [error.path[0]]: error.message,
          }),
          {}
        )
      );
      return;
    }

    try {
      await axios.post("/api/user", {
        name,
        email,
        password,
        provider: "credentials",
        role: selectedRole,
      });
      if (nameRef.current) nameRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";
      setSelectedRole("VIEWER");
      fetchUsers();
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  // ユーザーの削除
  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete("/api/user", {
        data: { id },
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // ユーザー情報の更新
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await axios.put("/api/user", {
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        provider: editingUser.provider,
        role: editingUser.role,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <BaseContainer>
      <Box sx={{ mb: 10 }}>
        {/* ユーザー追加フォーム（カード型） */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: 500,
            margin: "auto",
            mb: 10,
          }}
        >
          {/* <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            ユーザー管理
          </Typography> */}
          <TextField
            inputRef={nameRef}
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={() => handleChange("name")}
            fullWidth
            margin="normal"
          />
          <TextField
            inputRef={emailRef}
            label="Email"
            error={Boolean(errors.email)}
            helperText={errors.email}
            onChange={() => handleChange("email")}
            fullWidth
            margin="normal"
          />
          <TextField
            inputRef={passwordRef}
            label="Password"
            type="password"
            error={Boolean(errors.password)}
            helperText={errors.password}
            onChange={() => handleChange("password")}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "ADMIN" | "EDITOR" | "VIEWER")}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="EDITOR">Editor</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAddUser}
            fullWidth
            sx={{
              mt: 2,
              height: 50,
              fontSize: "1rem", // フォントサイズを1.25remに
            }}
          >
            ユーザーを追加
          </Button>
        </Paper>
        
        {/* 登録済みユーザーの表示 */}
        <Typography variant="h6">登録済みユーザー</Typography>
        <List>
          {users?.map((user) => (
            <React.Fragment key={user.id}>
              <ListItem>
                {isMobile ? (
                  // モバイルレイアウト: 縦並び
                  <Stack spacing={1} width="100%" alignItems="center">
                    <ListItemText
                      primary={`${user.name} (${user.email})`}
                      secondary={`ID: ${user.id} | Role: ${user.role}`}
                      sx={{ textAlign: "center" }} // テキスト中央寄せ
                    />
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? ""}
                      sx={{ width: 60, height: 60 }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button onClick={() => setEditingUser(user)}>編集</Button>
                      <Button color="error" onClick={() => handleDeleteUser(user.id)}>
                        削除
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  // PCレイアウト: 横並び
                  <>
                    <ListItemText
                      primary={`${user.name} (${user.email})`}
                      secondary={`ID: ${user.id} | Role: ${user.role}`}
                    />
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? ""}
                      sx={{ width: 40, height: 40, marginRight: 2 }}
                    />
                    <Button onClick={() => setEditingUser(user)}>編集</Button>
                    <Button color="error" onClick={() => handleDeleteUser(user.id)}>
                      削除
                    </Button>
                  </>
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>{" "}
      </Box>

      {/* 編集モーダル */}
      {editingUser && (
        <Modal open={Boolean(editingUser)} onClose={() => setEditingUser(null)}>
          <Box
            sx={{
              p: 4,
              width: "90%",
              maxWidth: "500px",
              backgroundColor: "white",
              borderRadius: 2,
              textAlign: "center",
              margin: "auto",
              top: "50%",
              position: "absolute",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {!editingUser?.provider && (
              <>
                <TextField
                  label="Name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                    })
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                  margin="normal"
                />
              </>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as "ADMIN" | "EDITOR" | "VIEWER",
                  })
                }
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="EDITOR">Editor</MenuItem>
                <MenuItem value="VIEWER">Viewer</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleUpdateUser}>
              保存
            </Button>
          </Box>
        </Modal>
      )}
    </BaseContainer>
  );
}
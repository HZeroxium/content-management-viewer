// src/app/dashboard/users/[id]/page.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUser, useSaveUser } from "@/lib/query/users.queries";
import { LoginFormData } from "@/app/login/schema"; // reuse zod or define new schema
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";

const roles = ["admin", "editor", "client"] as const;

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const isNew = id === "new";
  const { data: user, isLoading } = useUser(isNew ? "" : id);
  const saveUser = useSaveUser();
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm<Partial<User>>({
    defaultValues: { email: "", name: "", role: "client" },
  });

  useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const onSubmit = async (data: Partial<User>) => {
    await saveUser.mutateAsync({ id: isNew ? undefined : id, ...data });
    router.push("/dashboard/users");
  };

  if (!isNew && isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ p: 2, maxWidth: 480 }}
    >
      <Typography variant="h6" mb={2}>
        {isNew ? "Create User" : `Edit ${user?.email}`}
      </Typography>

      <Controller
        name="email"
        control={control}
        rules={{ required: "Email is required" }}
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...field}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField label="Name" fullWidth margin="normal" {...field} />
        )}
      />

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <TextField label="Role" select fullWidth margin="normal" {...field}>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={saveUser.isLoading}
        sx={{ mt: 2 }}
      >
        {isNew ? "Create" : "Save"}
      </Button>
    </Box>
  );
}

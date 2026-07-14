/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState } from "react";
import { ChevronLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { registerUser } from "@/services/userService";

interface CreateUserForm {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

const initialForm: CreateUserForm = {
  username: "",
  firstName: "",
  lastName: "",
  password: "",
};

const CreateUserView = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateUserForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof CreateUserForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.firstName || !form.lastName || !form.password) {
      setErrorMessage("Por favor, complete todos los campos.");
      setErrorOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerUser(form);
      if (response.ok) {
        setSuccessOpen(true);
        setForm(initialForm);
      } else {
        const data = (await response.json()) as { message?: string };
        setErrorMessage(data.message || "Error al crear el usuario.");
        setErrorOpen(true);
      }
    } catch {
      setErrorMessage("Ocurrió un error inesperado al crear el usuario.");
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-body mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/admin/users")}
          className="text-on-surface-variant hover:text-primary gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Usuarios
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-2 max-w-2xl mb-8">
        <div className="flex items-center gap-3">
          <UserPlus className="text-primary-container w-7 h-7" />
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter">
            Crear Usuario
          </h1>
        </div>
        <p className="text-on-surface-variant font-body text-sm leading-relaxed">
          Complete el formulario para registrar un nuevo usuario en la plataforma.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Usuario / Correo"
            type="email"
            placeholder="name@institute.edu"
            value={form.username}
            onChange={handleChange("username")}
          />
          <FormField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
          />
          <FormField
            label="Nombre"
            type="text"
            placeholder="John"
            value={form.firstName}
            onChange={handleChange("firstName")}
          />
          <FormField
            label="Apellido"
            type="text"
            placeholder="Doe"
            value={form.lastName}
            onChange={handleChange("lastName")}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/dashboard/admin/users")}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear usuario"}
          </Button>
        </div>
      </form>

      <SuccessModal
        open={successOpen}
        title="Usuario creado"
        message="El usuario fue creado exitosamente."
        onClose={() => setSuccessOpen(false)}
      />

      <ErrorModal
        open={errorOpen}
        title="Error"
        message={errorMessage || "Ocurrió un error al crear el usuario."}
        onClose={() => setErrorOpen(false)}
      />
    </div>
  );
};

export default CreateUserView;

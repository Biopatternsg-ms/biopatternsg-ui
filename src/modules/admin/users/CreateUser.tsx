import { useNavigate } from "react-router-dom";
import { DataForm } from "@/components/organisms/DataForm";
import * as z from "zod";
import { toCreateAdminUserPayload, type CreateAdminUserFormValues } from "@/adapters/userAdapter";
import { createAdminUser } from "@/services/userService";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/atoms/Button";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido.")
    .email("Ingresa un correo válido."),
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre es demasiado largo."),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(50, "El apellido es demasiado largo."),
});

const CreateUser = () => {
  const navigate = useNavigate();

  const createUserConfig: DataFormConfig<CreateAdminUserFormValues> = {
    schema: createUserSchema,
    fields: [
      {
        name: "email",
        label: "Institutional Email",
        type: "email",
        placeholder: "name@institute.edu",
        colSpan: "full",
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "Jane",
        colSpan: "half",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        colSpan: "half",
      },
    ],
    title: "Crear Nuevo Usuario",
    subtitle: "Añadir un investigador a la plataforma",
    submitLabel: "Crear Usuario",
    submittingLabel: "Creando...",
    onSubmit: async (values) => {
      const payload = toCreateAdminUserPayload(values);
      return createAdminUser(payload);
    },
    successStatus: 201, // Asumimos que el backend retorna 201 Created o 200 OK
    successModal: {
      title: "¡Usuario creado!",
      message: "El usuario ha sido creado exitosamente.",
    },
    errorModal: {
      title: "No se pudo crear el usuario",
      defaultMessage: "Error en el servidor. Por favor, intente de nuevo más tarde.",
      parseResponseMessage: true,
    },
    onSuccessClose: () => {
      navigate("/dashboard/admin/users");
    },
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Scrollable container with padding */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
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

        {/* Centered Form similar to Register */}
        <div className="max-w-lg mx-auto">
          {/* Context Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Admin User Creation Session
            </span>
          </div>

          <DataForm config={createUserConfig} />
        </div>
      </div>
    </div>
  );
};

export default CreateUser;

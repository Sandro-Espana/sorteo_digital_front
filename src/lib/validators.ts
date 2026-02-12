// src/lib/validators.ts
export type ClienteForm = {
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  direccion: string;
};

export type ClienteErrors = Partial<Record<keyof ClienteForm, string>>;

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export function normalizeClienteForm(v: ClienteForm): ClienteForm {
  return {
    nombres: v.nombres.trim(),
    apellidos: v.apellidos.trim(),
    celular: v.celular.trim(),
    email: v.email.trim(),
    direccion: v.direccion.trim(),
  };
}

/**
 * Regla recomendada (alineada a tu backend):
 * - nombres: requerido (>= 3)
 * - al menos un contacto: celular o email
 * - celular: si existe, solo dígitos y longitud 7..15 (ajústalo)
 * - email: si existe, formato válido
 * - dirección: si existe, >= 3 (opcional)
 */
export function validateCliente(form: ClienteForm): ClienteErrors {
  const f = normalizeClienteForm(form);
  const errors: ClienteErrors = {};

  if (!f.nombres || f.nombres.length < 3) {
    errors.nombres = "Ingresa un nombre válido (mín. 3 caracteres).";
  }

  const hasCel = !!f.celular;
  const hasEmail = !!f.email;

  if (!hasCel && !hasEmail) {
    // Puedes poner este error en ambos campos para que sea visible.
    errors.celular = "Debes ingresar celular o email.";
    errors.email = "Debes ingresar celular o email.";
  }

  if (hasEmail && !emailRegex.test(f.email)) {
    errors.email = "Email inválido.";
  }

  if (hasCel) {
    const digits = onlyDigits(f.celular);
    if (digits.length !== f.celular.length) {
      errors.celular = "El celular debe contener solo números.";
    } else if (digits.length < 7 || digits.length > 15) {
      errors.celular = "Celular inválido (7 a 15 dígitos).";
    }
  }

  if (f.direccion && f.direccion.length < 3) {
    errors.direccion = "Dirección muy corta (mín. 3 caracteres).";
  }

  return errors;
}

export function isEmptyErrors(errors: ClienteErrors) {
  return Object.keys(errors).length === 0;
}

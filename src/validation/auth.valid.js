import * as yup from "yup";

const registerSchema = yup.object().shape({
  email: yup.string().email().required(),
  fullName: yup.string().required(),
  password: yup.string().required(),
  bankInfo: yup.string(),
  avatar: yup.string(),
  buget: yup.string(),
  qr: yup.string(),
  role: yup.string().oneOf(["admin", "user"]).default("user").required(),
});

const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const authValidSchema = {
  registerSchema,
  loginSchema,
};

export default authValidSchema;

import * as yup from "yup";

const transactionSchema = yup.object().shape({
  amount: yup.number().positive().required(),
  discount: yup.number().min(0).required(),
  type: yup.string().oneOf(["uniform", "uneven"]).required(),
  date: yup.string().required(),
  description: yup.string().required(),
  status: yup.string().default("inprocess"),
  transactionDetail: yup
    .array()
    .of(
      yup.object().shape({
        user: yup.string().required(),
        moneyDetail: yup.number().positive().required(),
        status: yup.string().oneOf(["inprocess", "done"]).required(),
      })
    )
    .required(),
});

const transactionValidSchema = {
  transactionSchema,
};

export default transactionValidSchema;

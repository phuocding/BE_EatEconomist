import { format } from "date-fns";
import { formatMoney } from "./index.js";

const createMessage = (transaction, transactionDetail) => {
  var participant = "";
  transactionDetail.forEach((element) => {
    participant +=
      " - " +
      element.user.fullName +
      " - " +
      element.name +
      " - " +
      formatMoney(element.debitAmount) +
      "\n";
  });

  const text = `
<b>Đơn hàng mới đã được tạo</b>

- Tên đơn: ${transaction.description}
- Ngày: ${transaction.date && format(new Date(transaction?.date), "dd/MM/yyyy")}
- Kiểu đơn: ${transaction.type == "uniform" ? "Chia đều" : "Chia lẻ"}
- Tổng tiền: ${formatMoney(transaction.amount)}
- Giảm giá: ${formatMoney(transaction.discount)}
- Chủ đơn: ${transaction.owner.fullName}
- Thông tin thanh toán: ${transaction.owner.bankNumber} - ${
    transaction.owner.bankName
  }
-------------------------
<b>Người tham gia</b>
${participant}

<i>Check chi tiết tại:</i> https://fe-eateconomist.onrender.com/ `;

  return text;
};

const paymentSuccessMessage = (data) => {
  const text =
    data.status == "done"
      ? `
    <b>${data.user.fullName} đã thanh toán</b>
    - Số tiền : ${data.debitAmount && formatMoney(data.debitAmount)}
    - Đơn hàng : ${data.name}
    - Vào lúc: ${
      data.updatedAt && format(new Date(data.updatedAt), "HH:mm:ss yyyy-MM-dd")
    }
    `
      : `
    <b>${data.user.fullName} thanh toán LỖI</b>
    - Số tiền : ${data.debitAmount && formatMoney(data.debitAmount)}
    - Đơn hàng : ${data.name}
    - Vào lúc: ${
      data.updatedAt && format(new Date(data.updatedAt), "HH:mm:ss yyyy-MM-dd")
    }
    `;

  return text;
};

const sendToTeleBot = async (text) => {
  const bot_token = process.env.BOT_TELE_TOKEN || "";
  const chat_id = process.env.CHAT_ID || "";
  const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat_id,
        text: text,
        parse_mode: "HTML", // Đặt parse_mode là HTML để nội dung tin nhắn được hiển thị đúng định dạng
      }),
    });

    const data = await response.json();
    console.log("Message sent: ", data);
  } catch (error) {
    console.error("Error sending message: ", error);
  }
};

const teleBot = {
  sendToTeleBot,
  createMessage,
  paymentSuccessMessage,
};

export default teleBot;

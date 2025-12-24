import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(cors({
  origin: "https://stock-transfer-management-frontend.vercel.app",
  credentials: true,
}));



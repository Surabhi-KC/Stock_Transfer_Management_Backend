import express from 'express';
import cors from 'cors';

import warehouseRoutes from './routes/warehouse.routes.js';
import stockRoutes from './routes/stock.routes.js';
import transferRoutes from './routes/transfer.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/warehouses', warehouseRoutes);
app.use('/stocks', stockRoutes);
app.use('/transfers', transferRoutes);

export default app;

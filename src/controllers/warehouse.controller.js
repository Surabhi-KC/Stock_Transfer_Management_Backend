import prisma from '../utils/prisma.js';

export const createWarehouse = async (req, res) => {
  const { name, location } = req.body;

  const warehouse = await prisma.warehouse.create({
    data: {
      name,
      location,
      userId: req.userId,
    },
  });

  res.status(201).json(warehouse);
};

export const getWarehouses = async (req, res) => {
  const warehouses = await prisma.warehouse.findMany({
    where: { userId: req.userId },
  });
  res.json(warehouses);
};

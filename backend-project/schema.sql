CREATE DATABASE IF NOT EXISTS SMS;
USE SMS;

CREATE TABLE IF NOT EXISTS Product (
  productCode VARCHAR(30) PRIMARY KEY,
  productName VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantityInStock INT NOT NULL DEFAULT 0,
  unitPrice DECIMAL(12, 2) NOT NULL,
  supplierName VARCHAR(120) NOT NULL,
  dateReceived DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Warehouse (
  warehouseCode VARCHAR(30) PRIMARY KEY,
  warehouseName VARCHAR(120) NOT NULL,
  warehouseLocation VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS StockTransaction (
  transactionId INT AUTO_INCREMENT PRIMARY KEY,
  productCode VARCHAR(30) NOT NULL,
  warehouseCode VARCHAR(30) NOT NULL,
  transactionDate DATE NOT NULL,
  quantityMoved INT NOT NULL,
  transactionType ENUM('IN', 'OUT') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_product
    FOREIGN KEY (productCode) REFERENCES Product(productCode)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transaction_warehouse
    FOREIGN KEY (warehouseCode) REFERENCES Warehouse(warehouseCode)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS UserAccount (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

INSERT INTO UserAccount (username, password)
VALUES ('admin', 'admin123')
ON DUPLICATE KEY UPDATE username = username;

# Entity Relationship Diagram

## Entities

Product

- `productCode` PK
- `productName`
- `category`
- `quantityInStock`
- `unitPrice`
- `supplierName`
- `dateReceived`

Warehouse

- `warehouseCode` PK
- `warehouseName`
- `warehouseLocation`

StockTransaction

- `transactionId` PK
- `productCode` FK references `Product(productCode)`
- `warehouseCode` FK references `Warehouse(warehouseCode)`
- `transactionDate`
- `quantityMoved`
- `transactionType`

## Cardinalities

- One Product can have many StockTransactions.
- One Warehouse can have many StockTransactions.
- Each StockTransaction belongs to exactly one Product and one Warehouse.

```mermaid
erDiagram
  Product ||--o{ StockTransaction : has
  Warehouse ||--o{ StockTransaction : records

  Product {
    varchar productCode PK
    varchar productName
    varchar category
    int quantityInStock
    decimal unitPrice
    varchar supplierName
    date dateReceived
  }

  Warehouse {
    varchar warehouseCode PK
    varchar warehouseName
    varchar warehouseLocation
  }

  StockTransaction {
    int transactionId PK
    varchar productCode FK
    varchar warehouseCode FK
    date transactionDate
    int quantityMoved
    enum transactionType
  }
```

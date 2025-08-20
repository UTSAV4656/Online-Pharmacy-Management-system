--1. Users
Use OnlinePharmacy

CREATE TABLE Users (
    UserId 		INT PRIMARY KEY IDENTITY,
    FullName 	NVARCHAR(100),
    Email 		NVARCHAR(100) UNIQUE,
    Password 	NVARCHAR(255),
    Role		NVARCHAR(50), -- Admin, Pharmacist, Customer
    CreatedAt 	DATETIME DEFAULT GETDATE()
)
INSERT INTO Users (FullName, Email, Password, Role)
VALUES 
('Utsav Boghani', 'utsav@example.com', 'Utsav@123', 'Admin'),
('Priya Verma', 'priya@example.com', 'pass456', 'Customer'),
('Aman Joshi', 'aman@example.com', 'pass789', 'Pharmacist'),
('Sunita Mehra', 'sunita@example.com', 'pass321', 'Admin'),
('Deepak Kumar', 'deepak@example.com', 'pass654', 'Customer'),
('Ritika Singh', 'ritika@example.com', 'pass987', 'Pharmacist'),
('Anil Patel', 'anil@example.com', 'pass111', 'Customer'),
('Meena Kumari', 'meena@example.com', 'pass222', 'Customer'),
('Vikas Dubey', 'vikas@example.com', 'pass333', 'Customer'),
('Sneha Rani', 'sneha@example.com', 'pass444', 'Customer');



--2.Customer

CREATE TABLE Customers (
    CustomerId 		INT PRIMARY KEY IDENTITY,
    UserId 			INT FOREIGN KEY REFERENCES Users(UserId),
    Address 		NVARCHAR(255),
    PhoneNumber 	NVARCHAR(15)
)
INSERT INTO Customers (UserId, Address, PhoneNumber)
VALUES 
(1, 'Rajkot', '9876543210'),
(2, 'Mumbai', '7894561230'),
(5, 'Pune', '9812312345'),
(7, 'Ahmedabad', '7891234567'),
(8, 'Surat', '7001234567'),
(9, 'Indore', '8123456780'),
(10, 'Lucknow', '9345612780'),
(1, 'Delhi', '8888888888'),
(2, 'Mumbai', '9999999999'),
(5, 'Pune', '7777777777');



--3. Medicines

CREATE TABLE Medicines (
    MedicineId 		INT PRIMARY KEY IDENTITY,
    Name 			NVARCHAR(100),
    Brand 			NVARCHAR(100),
    Description 	NVARCHAR(255),
    Price 			DECIMAL(10,2),
    QuantityInStock INT,
    ExpiryDate 		DATE
)
INSERT INTO Medicines (Name, Brand, Description, Price, QuantityInStock, ExpiryDate)
VALUES
('Paracetamol', 'Cipla', 'Pain reliever', 25.00, 100, '2026-05-01'),
('Aspirin', 'Zydus', 'Blood thinner', 40.00, 150, '2026-12-15'),
('Amoxicillin', 'Sun Pharma', 'Antibiotic', 55.00, 200, '2025-11-01'),
('Cetirizine', 'Alkem', 'Allergy medicine', 10.00, 300, '2025-10-10'),
('Dolo 650', 'Micro Labs', 'Fever reducer', 30.00, 180, '2027-01-01'),
('Metformin', 'Torrent', 'Diabetes medicine', 60.00, 120, '2026-06-01'),
('Atorvastatin', 'Dr Reddy', 'Cholesterol control', 75.00, 90, '2025-09-15'),
('Ibuprofen', 'Pfizer', 'Painkiller', 20.00, 250, '2026-04-04'),
('Omeprazole', 'Cadila', 'Acidity relief', 35.00, 200, '2026-08-01'),
('Levocetirizine', 'Glenmark', 'Anti-allergic', 15.00, 170, '2026-03-20');


--4. Categories

CREATE TABLE Categories (
    CategoryId 		INT PRIMARY KEY IDENTITY,
    Name 			NVARCHAR(100)
)
INSERT INTO Categories (Name)
VALUES
('Painkiller'),
('Antibiotic'),
('Antipyretic'),
('Anti-allergic'),
('Diabetes'),
('Cholesterol'),
('Cardiology'),
('Gastrointestinal'),
('General'),
('OTC');


-- Link Medicine to Category
CREATE TABLE MedicineCategories (
    MedicineId 		INT FOREIGN KEY REFERENCES Medicines(MedicineId),
    CategoryId 		INT FOREIGN KEY REFERENCES Categories(CategoryId),
    PRIMARY KEY (MedicineId, CategoryId)
)
INSERT INTO MedicineCategories (MedicineId, CategoryId)
VALUES
(1, 1), (2, 6), (3, 2), (4, 4), (5, 3),
(6, 5), (7, 6), (8, 1), (9, 8), (10, 4);



--5. Orders

CREATE TABLE Orders (
    OrderId 		INT PRIMARY KEY IDENTITY,
    CustomerId 		INT FOREIGN KEY REFERENCES Customers(CustomerId),
    OrderDate 		DATETIME DEFAULT GETDATE(),
    TotalAmount 	DECIMAL(10,2),
    Status 			NVARCHAR(50) -- Pending, Completed, Cancelled
)
INSERT INTO Orders (CustomerId, TotalAmount, Status)
VALUES
(1, 100.00, 'Completed'),
(2, 200.00, 'Pending'),
(3, 150.00, 'Cancelled'),
(4, 80.00, 'Completed'),
(5, 250.00, 'Completed'),
(6, 300.00, 'Pending'),
(7, 180.00, 'Cancelled'),
(1, 120.00, 'Pending'),
(2, 400.00, 'Completed'),
(3, 90.00, 'Pending');



--6. OrderDetails

CREATE TABLE OrderDetails (
    OrderDetailId 	INT PRIMARY KEY IDENTITY,
    OrderId 		INT FOREIGN KEY REFERENCES Orders(OrderId),
    MedicineId 		INT FOREIGN KEY REFERENCES Medicines(MedicineId),
    Quantity 		INT,
    UnitPrice 		DECIMAL(10,2)
)
INSERT INTO OrderDetails (OrderId, MedicineId, Quantity, UnitPrice)
VALUES
(1, 1, 2, 25.00),
(2, 2, 1, 40.00),
(3, 3, 3, 55.00),
(4, 4, 2, 10.00),
(5, 5, 4, 30.00),
(6, 6, 2, 60.00),
(7, 7, 1, 75.00),
(8, 8, 3, 20.00),
(9, 9, 1, 35.00),
(10, 10, 2, 15.00);



--7. Prescriptions (Optional)

CREATE TABLE Prescriptions (
    PrescriptionId 	INT PRIMARY KEY IDENTITY,
    CustomerId 		INT FOREIGN KEY REFERENCES Customers(CustomerId),
    UploadedByUserId 	INT FOREIGN KEY REFERENCES Users(UserId),
    PrescriptionImage 	NVARCHAR(255), -- Path to file
    UploadDate 		DATETIME DEFAULT GETDATE()
)
INSERT INTO Prescriptions (CustomerId, UploadedByUserId, PrescriptionImage)
VALUES
(1, 3, 'presc_1.jpg'),
(2, 6, 'presc_2.jpg'),
(3, 3, 'presc_3.jpg'),
(4, 6, 'presc_4.jpg'),
(5, 3, 'presc_5.jpg'),
(6, 6, 'presc_6.jpg'),
(7, 3, 'presc_7.jpg'),
(1, 6, 'presc_8.jpg'),
(2, 3, 'presc_9.jpg'),
(3, 6, 'presc_10.jpg');



--8. Payments

CREATE TABLE Payments (
    PaymentId 		INT PRIMARY KEY IDENTITY,
    OrderId 		INT FOREIGN KEY REFERENCES Orders(OrderId),
    PaymentDate 	DATETIME DEFAULT GETDATE(),
    AmountPaid 		DECIMAL(10,2),
    PaymentMethod 	NVARCHAR(50), -- Card, UPI, COD
    PaymentStatus 	NVARCHAR(50) -- Success, Failed
)

INSERT INTO Payments (OrderId, AmountPaid, PaymentMethod, PaymentStatus)
VALUES
(1, 100.00, 'Card', 'Success'),
(2, 200.00, 'UPI', 'Success'),
(3, 150.00, 'COD', 'Failed'),
(4, 80.00, 'Card', 'Success'),
(5, 250.00, 'UPI', 'Success'),
(6, 300.00, 'Card', 'Failed'),
(7, 180.00, 'COD', 'Success'),
(8, 120.00, 'UPI', 'Success'),
(9, 400.00, 'Card', 'Success'),
(10, 90.00, 'UPI', 'Pending');

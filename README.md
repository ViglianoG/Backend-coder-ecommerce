# Backend e-commerce

_[en]_ Fully functional e-commerce developed with Node.js, Express and MongoDB, tested with Mocha, Chai and Supertest and documented with Swagger. It includes authentication and authorization system.
_[es]_ E-commerce completamente funcional desarrollado con Node.js, Express y MongoDB, testeado con Mocha, Chai y Supertest y documentado con Swagger. Cuenta con un servicio de autenticación y autorización.

## Status

In progress

## Features

- Fully functional e-commerce connected to a payment processing platform.
- Authentication and authorization service that includes user registration, login and logout, password change and role change between normal and premium user.
- Auth service implemented with Passport and JSON Web Tokens.
- Security measures.
- Design patterns including layered architecture, DAO, DTO and Repository.
- Premium role which can create, update or delete its own products.
- Administrator role with elevated permissions.
- Products are accesed through the MongoDB database.
- Products pagination and filter by category.
- Database persistance for users, products, carts and tickets.
- Mailing service for user registration, checkout, password change and when a premium user's product gets deleted.
- File upload service. Profile picture, product images and documents to upgrade to premium.
- Unit and integration testing with Mocha, Chai and Supertest.
- API documentation done with Swagger.

## Características:

- Proceso de compra completamente funcional conectado con pasarela de pago.
- Servicio de autenticación y autorización que incluye registro de usuarios, inicio y cierre de sesión, cambio de contraseña y cambio de rol entre usuario normal y premium.
- Utilización de Passport y JWT para el servicio de autenticación.
- Implementaciones de seguridad.
- Aplicación de patrones de diseño, incluyendo arquitectura por capas, DAO, DTO y Repository.
- Rol de usuario premium con posibilidad de crear, modificar o eliminar sus propios productos.
- Rol de administrador con permisos elevados.
- Acceso a los productos a través de base de datos de MongoDB.
- Paginación de productos y filtrado por categorías.
- Almacenamiento en base de datos de usuarios, productos, carritos y tickets de compra.
- Servicio de mailing. Se recibe un email al registrar un usuario, al realizar una compra, al solicitar un cambio de contraseña y al eliminarse un producto de un usuario premium.
- Servicio de subida de archivos. Foto de perfil, imágenes de producto y documentos para actualizar el usuario a premium.
- Tests unitarios y de integración con Mocha, Chai y Supertest.
- Documentación de la API realizada con Swagger.

## Created with:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)  
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white) ![Chai](https://img.shields.io/badge/chai.js-323330?style=for-the-badge&logo=chai&logoColor=red) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

<!-- ## Documentation -->

## Frontend

Handlebars: Inside the project
React: Coming soon

## Deploy

https://backend-coder-ecommerce.vercel.app/

https://backend-coder-ecommerce-production.up.railway.app/

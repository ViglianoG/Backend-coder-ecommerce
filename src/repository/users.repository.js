import UserDTO from "../dao/DTO/user.dto.js";

export default class UsersRepository {
    constructor(dao) {
        this.dao = dao
    }

    getUsers = async () => await this.dao.get()

    getUserById = async (id) => {
        const user = await this.dao.getOneById(id)
        return new UserDTO(user)
    }

    getUserByEmail = async (email) => {
        return await this.dao.getOneByEmail(email)
    }
    
    createUser = async (data) => {
        return await this.dao.create(data)
    }
}
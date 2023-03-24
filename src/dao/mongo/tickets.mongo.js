import TicketModel from "./models/user.model.js"

export default class Tickets {
    constructor() {}

    create = async (data) => await TicketModel.create(data)
}
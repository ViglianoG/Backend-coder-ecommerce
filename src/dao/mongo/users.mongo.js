import UserModel from "./models/user.model.js";

export default class User {
  constructor() {}
  get = async () => {
    return await UserModel.find().lean().exec();
  };

  create = async (data) => {
    const user = await UserModel.create(data);
    return user;
  };

  getByID = async (id) => {
    return await UserModel.findById(id).lean().exec();
  };

  getByEmail = async (email) => {
    return await UserModel.findOne({
      email,
    })
      .lean()
      .exec();
  };

  update = async (id, data) => {
    return await UserModel.updateOne({ _id: id }, data);
  };
}

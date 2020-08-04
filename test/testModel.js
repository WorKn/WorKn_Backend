module.exports = async function test(new_element, Model) {
  try {
    const created_user = await Model.create(new_element);

    console.log(created_user);
  } catch (e) {
    console.log(e);
  }
};

const userService = require('./user.service')

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({
      message: 'User created successfully',
      data: user
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create user',
      error: error.message
    })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers()
    res.json({
      message: 'Users list retrieved successfully',
      data: users
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve users list',
      error: error.message
    })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'User ID is required' })

    const user = await userService.getUserById(id)
    res.json({
      message: 'User details retrieved successfully',
      data: user
    })
  } catch (error) {
    res.status(404).json({
      message: 'User not found',
      error: error.message
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'User ID is required' })

    const user = await userService.updateUser(id, req.body)
    res.json({
      message: 'User updated successfully',
      data: user
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message
    })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'User ID is required' })

    await userService.deleteUser(id)
    res.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: error.message
    })
  }
}

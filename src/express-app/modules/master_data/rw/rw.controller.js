const rwService = require('./rw.service')

exports.createRw = async (req, res) => {
  try {
    const rw = await rwService.createRw(req.body)
    res.status(201).json({
      message: 'RW created successfully',
      data: rw
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create RW',
      error: error.message
    })
  }
}

exports.getAllRw = async (req, res) => {
  try {
    const rws = await rwService.getAllRw()
    res.json({
      message: 'RW list retrieved successfully',
      data: rws
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve RW list',
      error: error.message
    })
  }
}

exports.getRwById = async (req, res) => {
  try {
    const rw = await rwService.getRwById(req.params.id)
    res.json({
      message: 'RW details retrieved successfully',
      data: rw
    })
  } catch (error) {
    res.status(404).json({
      message: 'RW not found',
      error: error.message
    })
  }
}

exports.updateRw = async (req, res) => {
  try {
    const rw = await rwService.updateRw(req.params.id, req.body)
    res.json({
      message: 'RW updated successfully',
      data: rw
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update RW',
      error: error.message
    })
  }
}

exports.deleteRw = async (req, res) => {
  try {
    await rwService.deleteRw(req.params.id)
    res.json({
      message: 'RW deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete RW',
      error: error.message
    })
  }
}

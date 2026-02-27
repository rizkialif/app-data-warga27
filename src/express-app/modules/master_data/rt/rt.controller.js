const rtService = require('./rt.service')

exports.createRt = async (req, res) => {
  try {
    const rt = await rtService.createRt(req.body)
    res.status(201).json({
      message: 'RT created successfully',
      data: rt
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create RT',
      error: error.message
    })
  }
}

exports.getAllRt = async (req, res) => {
  try {
    const rts = await rtService.getAllRt()
    res.json({
      message: 'RT list retrieved successfully',
      data: rts
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve RT list',
      error: error.message
    })
  }
}

exports.getRtById = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'RT ID is required' })

    const rt = await rtService.getRtById(id)
    res.json({
      message: 'RT details retrieved successfully',
      data: rt
    })
  } catch (error) {
    res.status(404).json({
      message: 'RT not found',
      error: error.message
    })
  }
}

exports.updateRt = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'RT ID is required' })

    const rt = await rtService.updateRt(id, req.body)
    res.json({
      message: 'RT updated successfully',
      data: rt
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update RT',
      error: error.message
    })
  }
}

exports.deleteRt = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ message: 'RT ID is required' })

    await rtService.deleteRt(id)
    res.json({
      message: 'RT deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete RT',
      error: error.message
    })
  }
}

const mainController = {}

mainController.buildHome = (req, res) => {
    res.render("index")
}

module.exports = mainController


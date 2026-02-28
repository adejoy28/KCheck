const util = {};

/**
 * Constructs the nav HTML unordered list
 */

// util.getNav = async function (req, res, next) {
//     let data = await invModel.getClassifications();

//     let list = "<button id='hamburger'>&#9776;</button>";
//     list += "<ul>";


//     list += '<li><a href="/" title="Home page">Home</a></li>';
//     data.rows.forEach(row => {
//         list += "<li>";
//         list += '<a href="/inv/type/' +
//             row.classification_id +
//             '" title="See out inventory of ' +
//             row.classification_name +


//             ' vehicles">' +
//             row.classification_name +
//             "</a>";
//         list += "</li>";
//     });
//     list += "</ul>";
//     return list
// }

util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = util;
var fs = require('fs')

// Add Quote -> Create File Function
exports.add_quote_file = async (data, user_id) => {
    // Quote Engineering Assigned to User
    await fs.copyFile('C:\Users\rdick\Desktop\dog','C:\Users\rdick\Desktop\cat')
    console.log('file copied!!!')
}
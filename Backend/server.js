import App from './src/App.js'

App.listen(process.env.PORT, () => {

    console.log('server is runing on ' + process.env.PORT);
})

const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
    host: HOST,
    port: PORT,
    ENV: ENV,
    HMR: HMR
});

module.exports = function (options) {
    return webpackMerge(commonConfig({env: ENV}), {

        // devtool: 'source-map',
        devtool: 'cheap-module-source-map',

        output: {
            path: helpers.root('dist'),
            filename: '[name].bundle.js',
            chunkFilename: '[id].chunk.js'
        },

        plugins: [

            // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
            new DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV),
                'HMR': METADATA.HMR,
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                    'NODE_ENV': JSON.stringify(METADATA.ENV),
                    'HMR': METADATA.HMR,
                    'TOKEN': JSON.stringify('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhiMzRjZDc0NDY3ZTI2ZjI3OGQ1ODExNWMxMDljNGMxMzkzNzY4YTJiODRhZGI4ZjU3NThlOTgyNGY4MDIxMDJhMjJlNThiMGUzY2IxNDM5In0.eyJhdWQiOiIxIiwianRpIjoiOGIzNGNkNzQ0NjdlMjZmMjc4ZDU4MTE1YzEwOWM0YzEzOTM3NjhhMmI4NGFkYjhmNTc1OGU5ODI0ZjgwMjEwMmEyMmU1OGIwZTNjYjE0MzkiLCJpYXQiOjE1MzY2NTQyNzUsIm5iZiI6MTUzNjY1NDI3NSwiZXhwIjoxNTM2NzQwNjc1LCJzdWIiOiIxIiwic2NvcGVzIjpbIioiXX0.GnzPlUH7MWeXGwJtO1Wf2mZCxiK5BmAvRrlhXIbERleedQDMp9VNdB3CqdOBTiOPDIDL6BvsIgqxl_v9dF4ntQagZ3WyvSAcRKcvl1KiLOcnrXcVVBOyMWNWg6pKkZ-GkmvF1iVlRq8fIE61t50h-64b4RtpD2Yqha2JSIYF1xS7EWe-RWj7a0bXiFTj627i31R0jRqdzk9n4II2pe6mRXee37iVTx4gRpA7QSFBSoypTb8HfhgxFTS8ROZvNZk-OGjT22sO-op08W1Pm6pa_I1SpwJPFSDdV9W102u-4zPSRdjJ0AQDOQEu4lxWQbhPaaSEVYYt_eWVwxdaFvTChjTzCQ7QCJpuPr0sJm6fAJZM1ej-6tnoydd_SPyGGMUU6g5lmb2-PlB5HoE09LXo7yfwhoPbyIzdxTuQXAmlMm_y7EEbGMpx-c2wUVvIqiN31hJ9q4uYPwbpu2ZQ9Bz4Mvve4gha98l16B7Tdq9JJntiawTSrPOT_p9eiZMMPr-aHOCKR8fwefvNDEyIm30RYfYrmegr6inG5x0d49bQFw7v3IPEa_79MHQQvpTFVzjC5uwAJ4I5_Yci0TjUYtj57USg75QqLUCcAH5kx52p_GAjugatJyPSswPUaXG_hI5Z4V3TlfiXvmuv5Ggk0cSLTNjoCjrPu_0Tkp80NjAYx2s'),
                    'BASE_URL': JSON.stringify('https://111b5687dbabc10cf5a4083bacfa418fcc7433e7.plentymarkets-cloud-ie.com'),
                    'PB_API_URL': JSON.stringify('https://pb.test/api'),
                    'PB_APP_ID': JSON.stringify('Lr7u9w86bUL5qsg7MJEVut8XYsqrZmTTxM67qFdH89f4NYQnHrkgKkMAsH9YLE4tjce4GtPSqrYScSt7w558USrVgXHB')
                }
            })
        ],

        devServer: {
            port: METADATA.port,
            host: METADATA.host,
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            historyApiFallback: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        }

    });
};

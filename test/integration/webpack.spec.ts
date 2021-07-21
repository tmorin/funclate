import {strict as assert} from 'assert'
import {existsSync, readFileSync, unlinkSync} from 'fs'
import {join} from 'path'
import webpack = require('webpack');

describe('webpack', () => {
    let context = join(__dirname, '../../'),
        outputFilename = 'funclate-loader.result',
        output = join(context, outputFilename)

    after(() => {
        if (existsSync(output)) {
            unlinkSync(output)
        }
    })

    it('should convert a funclate file into a string function', done => {
        webpack({
            context: context,
            entry: () => './test/integration/dummy.fc',
            output: {
                path: context,
                filename: outputFilename
            },
            mode: "development",
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    },
                    {test: /\.fc$/, loader: './lib/integration/webpack'}
                ]
            },
            resolve: {
                extensions: ['.fc']
            }
        }, (err, stats) => {
            if (err) {
                return done(err)
            }

            const info = stats.toJson()

            if (stats.hasErrors()) {
                return done(info.errors)
            }

            if (stats.hasWarnings()) {
                return done(info.warnings)
            }

            try {
                let result = readFileSync(output, 'utf8')
                assert.ok(result.indexOf(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], [])`) > -1)
                assert.ok(result.indexOf(`fcText('Hello')`) > -1)
                assert.ok(result.indexOf(`fcCloseElement()`) > -1)
            } catch (e) {
                return done(e)
            }
            done()
        })
    })

})

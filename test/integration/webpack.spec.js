import {join} from 'path';
import {existsSync, readFileSync, unlinkSync} from 'fs';
import webpack from 'webpack';
import {expect} from 'chai';

describe('webpack', () => {
    let context = join(__dirname, '../../'),
        outputFilename = 'funclate-loader.result',
        output = join(context, outputFilename);

    after(() => {
        if (existsSync(output)) {
            unlinkSync(output);
        }
    });

    it('should convert a funclate file into a string function', done => {
        webpack({
            context: context,
            entry: () => './test/integration/dummy.fc',
            output: {
                path: context,
                filename: outputFilename
            },
            module: {
                rules: [
                    {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
                    {test: /\.fc$/, loader: './src/integration/webpack'}
                ]
            },
            resolve: {
                extensions: ['.fc']
            }
        }, (err, stats) => {
            if (err) {
                return done(err);
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                return done(info.errors);
            }

            if (stats.hasWarnings()) {
                return done(info.warnings);
            }

            try {
                let result = readFileSync(output, 'utf8');
                expect(result).to.contain(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], []);`);
                expect(result).to.contain(`fcText('Hello');`);
                expect(result).to.contain(`fcCloseElement();`);
            } catch (e) {
                return done(e);
            }
            done();
        });
    });

});

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    entry: {
        // Main theme assets
        main: './wp-content/themes/historic-equity/static/js/main.js',
        contactForms: './wp-content/themes/historic-equity/static/js/contact-forms.js',
        projectFiltering: './wp-content/themes/historic-equity/static/js/project-filtering.js',
        mobileNavigation: './wp-content/themes/historic-equity/static/js/mobile-navigation.js',
        imageOptimization: './wp-content/themes/historic-equity/static/js/image-optimization.js',

        // Styles
        styles: './wp-content/themes/historic-equity/static/scss/style.scss'
    },

    output: {
        path: path.resolve(__dirname, 'wp-content/themes/historic-equity/dist'),
        filename: isProduction ? 'js/[name].[contenthash:8].min.js' : 'js/[name].js',
        chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
        publicPath: '/wp-content/themes/historic-equity/dist/',
        clean: true
    },

    module: {
        rules: [
            // JavaScript
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: [
                                        'last 2 versions',
                                        'ie >= 11',
                                        'safari >= 10'
                                    ]
                                },
                                modules: false,
                                useBuiltIns: 'usage',
                                corejs: 3
                            }]
                        ],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-proposal-object-rest-spread'
                        ]
                    }
                }
            },

            // SCSS/CSS
            {
                test: /\.(scss|sass|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'tailwindcss',
                                    'autoprefixer',
                                    ...(isProduction ? ['cssnano'] : [])
                                ]
                            },
                            sourceMap: !isProduction
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProduction,
                            sassOptions: {
                                outputStyle: isProduction ? 'compressed' : 'expanded'
                            }
                        }
                    }
                ]
            },

            // Images
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024 // 8kb
                    }
                },
                generator: {
                    filename: 'images/[name].[contenthash:8][ext]'
                }
            },

            // Fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[contenthash:8][ext]'
                }
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(),

        new MiniCssExtractPlugin({
            filename: isProduction ? 'css/[name].[contenthash:8].min.css' : 'css/[name].css',
            chunkFilename: isProduction ? 'css/[name].[contenthash:8].chunk.css' : 'css/[name].chunk.css'
        })
    ],

    optimization: {
        minimize: isProduction,
        minimizer: [
            // JavaScript minification
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: isProduction,
                        drop_debugger: isProduction,
                        pure_funcs: isProduction ? ['console.log', 'console.info'] : []
                    },
                    format: {
                        comments: false
                    },
                    mangle: {
                        safari10: true
                    }
                },
                extractComments: false
            }),

            // CSS minification
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true },
                            normalizeWhitespace: true,
                            colormin: true,
                            convertValues: true,
                            discardDuplicates: true,
                            discardEmpty: true,
                            mergeRules: true,
                            minifySelectors: true
                        }
                    ]
                }
            })
        ],

        // Code splitting
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // Vendor libraries
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: 10,
                    chunks: 'all'
                },

                // Common utilities
                common: {
                    name: 'common',
                    minChunks: 2,
                    priority: 5,
                    chunks: 'all',
                    enforce: true
                },

                // Historic Equity specific
                historicEquity: {
                    test: /[\\/]wp-content[\\/]themes[\\/]historic-equity[\\/]/,
                    name: 'historic-equity',
                    priority: 15,
                    chunks: 'all'
                }
            }
        },

        // Runtime chunk
        runtimeChunk: {
            name: 'runtime'
        }
    },

    // Performance budgets
    performance: {
        maxAssetSize: isProduction ? 250000 : 500000, // 250kb in production
        maxEntrypointSize: isProduction ? 400000 : 800000, // 400kb in production
        hints: isProduction ? 'error' : 'warning'
    },

    // Development server (for local development)
    devServer: {
        static: {
            directory: path.join(__dirname, 'wp-content/themes/historic-equity/dist')
        },
        hot: true,
        port: 3001,
        proxy: {
            '/': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    },

    // Resolve
    resolve: {
        extensions: ['.js', '.json', '.scss', '.css'],
        alias: {
            '@': path.resolve(__dirname, 'wp-content/themes/historic-equity/static'),
            '@scss': path.resolve(__dirname, 'wp-content/themes/historic-equity/static/scss'),
            '@js': path.resolve(__dirname, 'wp-content/themes/historic-equity/static/js'),
            '@images': path.resolve(__dirname, 'wp-content/themes/historic-equity/static/images')
        }
    },

    // Cache configuration
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename]
        }
    },

    // Stats configuration
    stats: {
        preset: 'minimal',
        moduleTrace: true,
        errorDetails: true
    }
};

// Historic Equity specific optimizations
if (isProduction) {
    module.exports.plugins.push(
        // Additional production optimizations can be added here
    );
}

module.exports.experiments = {
    // Enable modern features
    topLevelAwait: true
};
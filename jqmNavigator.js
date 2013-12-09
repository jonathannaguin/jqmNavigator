//////////////////////////////////////////////////////////////////////////////////////
//
//    Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//    Copyright 2013 Jonathan Nunez (jonathan.naguin@gmail.com)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(this, function ($) {

    $(document).bind("mobileinit", function () {

        // We want to handle link clicks from Backbone
        $.mobile.linkBindingEnabled = false;

        // We will handle forms programmatically
        $.mobile.ajaxEnabled = false;

        // We don't need this as we will be doing page navigation programmatically
        $.mobile.hashListeningEnabled = false;

        // We don't need this as we will be doing page navigation programmatically
        $.mobile.pushStateEnabled = false;

        // Turning off page auto initialization, we want to control it programmatically
        $.mobile.autoInitializePage = false;

        $.extend($.mobile, {
            jqmNavigator: {

                VERSION: '1.4.0',

                /**
                 * Map of containers and views
                 */
                _containers: [],

                /**
                 * If this is not set, jqmNavigator will use body tag as default container
                 */
                defaultPageContainer: null,

                /**
                 * Get the current page.
                 *
                 * @param [options]
                 * @returns {*}
                 */
                currentView: function (options) {

                    var containerViews = this._getPageContainerViews(options);
                    if (containerViews.views.length > 0) {
                        return containerViews.views[containerViews.views.length - 1];
                    } else {
                        return false;
                    }
                },

                /**
                 *
                 * Pushes view to the stack.
                 *
                 * @param view instance of Backbone View
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 * @param [endCallback] Callback when the target view is shown
                 */
                pushView: function (view, options, endCallback) {
                    var containerViews = this._getPageContainerViews(options);

                    // Pushing the view to the stack
                    containerViews.views.push(view);

                    // Appending the view to the DOM
                    containerViews.pageContainer.append(view.el);

                    // Rendering the view
                    view.render();

                    if (endCallback) {
                        view.$el.one('pageshow', function () {
                            endCallback();
                        });
                    }

                    if (!$.mobile.firstPage) {
                        // Adding data-role with page value
                        view.$el.attr('data-role', 'page');

                        // First time initialization
                        if (!$.mobile.autoInitializePage) {
                            $.mobile.initializePage();
                        }
                    } else {
                        // Changing page
                        containerViews.pageContainer.pagecontainer('change', view.$el, $.extend({
                            role: 'page',
                            changeHash: false
                        }, options));
                    }
                },

                /**
                 * Pops view from the stack.
                 *
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 * @returns {boolean} if succeeded
                 */
                popView: function (options) {
                    var containerViews = this._getPageContainerViews(options);

                    if (containerViews.views.length > 1) {
                        // From view ref
                        var fromView = containerViews.views.pop();

                        // To view ref
                        var toView = containerViews.views[containerViews.views.length - 1];

                        fromView.$el.one('pagehide', function () {
                            // Detaching view from DOM
                            fromView.remove();
                        });

                        // Changing to view below current one
                        containerViews.pageContainer.pagecontainer('change', toView.$el, $.extend({
                            role: 'page',
                            reverse: true,
                            changeHash: false
                        }, options));

                        return true;
                    } else {
                        return false;
                    }
                },

                /**
                 * Pops views from a stack up to the number (N) supplied.
                 *
                 * @param N {number} The number of views to pop back
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                popBackNViews: function (N, options) {
                    var containerViews = this._getPageContainerViews(options);

                    if (containerViews.views.length > 1) {
                        if (containerViews.views.length - N >= 1) {

                            // From view ref
                            var fromView = containerViews.views.pop();

                            // To view ref
                            var toView = containerViews.views[containerViews.views.length - N];

                            // Removed views
                            var removedViews = containerViews.views.splice((containerViews.views.length - N) + 1, containerViews.views.length - 1);

                            fromView.$el.one('pagehide', function () {

                                //Detach views in the middle
                                removedViews.forEach(function (item) {
                                    item.remove();
                                }, this);

                                //Detach origin
                                fromView.remove();
                            });

                            containerViews.pageContainer.pagecontainer('change', toView.$el, $.extend({
                                role: 'page',
                                reverse: true,
                                changeHash: false
                            }, options));

                        } else {
                            console.log('Cannot pop first view or below, you can replace it instead!');
                        }

                    } else {
                        console.log('Cannot pop first view, you can replace it instead!');
                    }
                },

                /**
                 * Pops views from a stack up to the first one.
                 *
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                popToFirst: function (options) {
                    var containerViews = this._getPageContainerViews(options);

                    if (containerViews.views.length > 1) {

                        // From view ref
                        var fromView = containerViews.views[containerViews.views.length - 1];

                        // To view ref
                        var toView = containerViews.views[0];

                        // Removed views
                        var removedViews = containerViews.views.splice(1, containerViews.views.length - 1);

                        fromView.$el.one('pagehide', function () {
                            removedViews.forEach(function (item) {
                                item.remove();
                            }, this);
                        });

                        // Changing to view below current one
                        containerViews.pageContainer.pagecontainer('change', toView.$el, $.extend({
                            role: 'page',
                            reverse: true,
                            changeHash: false
                        }, options));

                    } else {
                        console.log('Cannot pop first view, you can replace it instead!');
                    }
                },

                /**
                 *
                 * Replaces current view on the stack.
                 *
                 * @param view
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 * @param [endCallback] Callback when the target view is shown
                 */
                replaceView: function (view, options, endCallback) {
                    var containerViews = this._getPageContainerViews(options);

                    if (containerViews.views.length >= 1) {
                        // From view ref
                        var fromView = containerViews.views.pop();

                        fromView.$el.one('pagehide', function () {
                            // Detaching view from DOM
                            fromView.remove();
                        });

                        // Pushing the view to the stack
                        containerViews.views.push(view);

                        // Appending the view to the DOM
                        containerViews.pageContainer.append(view.el);

                        // Rendering the view
                        view.render();

                        if (endCallback) {
                            view.$el.one('pageshow', function () {
                                endCallback();
                            });
                        }

                        // Changing page
                        containerViews.pageContainer.pagecontainer('change', view.$el, $.extend({
                            role: 'page',
                            changeHash: false
                        }, options));
                    }
                },

                /**
                 * Replaces all views on the stack.
                 *
                 * @param view
                 * @param [options] {*} Transition parameters can be passed like: transition, reverse, showLoadMsg or loadMsgDelay
                 */
                replaceAll: function (view, options) {
                    var containerViews = this._getPageContainerViews(options);

                    if (containerViews.views.length >= 1) {

                        // From view ref
                        var fromView = containerViews.views[containerViews.views.length - 1];

                        // Removed views
                        var removedViews = containerViews.views.splice(0, containerViews.views.length);

                        fromView.$el.one('pagehide', function () {
                            removedViews.forEach(function (item) {
                                item.remove();
                            }, this);
                        });

                        // Pushing the view to the stack
                        containerViews.views.push(view);

                        // Appending the view to the DOM
                        containerViews.pageContainer.append(view.el);

                        // Rendering the view
                        view.render();

                        // Changing page
                        containerViews.pageContainer.pagecontainer('change', view.$el, $.extend({
                            role: 'page',
                            changeHash: false
                        }, options));

                    }
                },

                /**
                 * Get the page container view related with a `pageContainer`. It tries with:
                 *  - `pageContainer` object from `options`.
                 *  - $.mobile.pageContainer
                 *  - `defaultPageContainer`
                 *  - body
                 *
                 * @param options
                 * @returns {{pageContainer: Object, views: Array}}
                 * @private
                 */
                _getPageContainerViews: function (options) {

                    var pageContainer = options && options.pageContainer ? options.pageContainer :
                            $.mobile.pageContainer || this.defaultPageContainer || $('body'),
                        result;

                    this._containers.some(function (item) {
                        if (item.pageContainer[0] === pageContainer[0]) {
                            result = item;
                            return true;
                        }
                        return false;
                    }, this);

                    if (!result) {
                        result = {
                            pageContainer: pageContainer,
                            views: []
                        };

                        this._containers.push(result);
                    }

                    return result;
                },

                /**
                 * Returns an array of views for specified pageContainer. If pageContainer param is omitted it tries to
                 * return views of default container.
                 *
                 * @param pageContainer
                 * @return {*}
                 */
                getViews: function jqmNavigator_getViews(pageContainer) {
                    var views = null,
                        pc = pageContainer ? pageContainer[0] : ($.mobile.pageContainer ? $.mobile.pageContainer[0] : null);

                    this._containers.some(function (item) {
                        if (item.pageContainer[0] === pc) {
                            views = item.views;
                            return true;
                        }
                        return false;
                    }, this);

                    return views;
                }
            }
        });
    });
}));

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['exports', 'backbone', 'underscore'], function(exports, Backbone, _) {
      return factory(Backbone, _);
    });
  } else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    var _ = require('underscore');
    module.exports = factory(Backbone, _);
  } else {
    factory(root.Backbone, root._);
  }

}(this, function(Backbone, _) {
  "use strict";

  // BabySitter.ChildViewContainer
  // -----------------------------
  //
  // Provide a container to store, retrieve and
  // shut down child views.

  Backbone.ChildViewContainer = (function (Backbone, _) {

    // Container Constructor
    // ---------------------

    var Container = function(views){
      this._views = [];
      this._indexByModel = {};
      this._indexByCid = {};
      this._indexByCustom = {};
      this._updateLength();

      _.each(views, this.add, this);
    };

    // Container Methods
    // -----------------

    _.extend(Container.prototype, {

      // Add a view to this container. Stores the view
      // by `cid` and makes it searchable by the model
      // cid (and model itself). Optionally specify
      // a custom key to store an retrieve the view.
      add: function(view, options){
        var addOptions = options || {};

        var viewCid = view.cid;
        var customIndex = addOptions.customIndex || addOptions;

        // add at the specified index or append to the end
        var index = addOptions.at || this._views.length;

        if (index > this._views.length) {
          index = this._views.length;
        }

        // store the view
        // if an index is specified we need to insert
        // at that index, otherwise just append.
        if (index < this._views.length) {
          this._views.splice(index, 0, view);
        }
        else {
          this._views[index] = view;
        }

        // increment other indices before indexing the new view
        this._incrementIndices(index);

        // index it by Cid
        this._indexByCid[viewCid] = index;

        // index it by model
        if (view.model){
          this._indexByModel[view.model.cid] = index;
        }

        // index by custom
        if (customIndex){
          this._indexByCustom[customIndex] = index;
        }

        this._updateLength();

        return this;
      },

      // Find a view by the model that was attached to
      // it. Uses the model's `cid` to find it.
      findByModel: function(model){
        return this.findByModelCid(model.cid);
      },

      // Find a view by the `cid` of the model that was attached to
      // it. Uses the model's `cid` to find the view `cid` and
      // retrieve the view using it.
      findByModelCid: function(modelCid){
        var index = this._indexByModel[modelCid];
        return this.findByIndex(index);
      },

      // Find a view by a custom indexer.
      findByCustom: function(customIndex){
        var index = this._indexByCustom[customIndex];
        return this.findByIndex(index);
      },

      // Find by index.
      findByIndex: function(index){
        return this._views[index];
      },

      // retrieve a view by its `cid` directly
      findByCid: function(cid){
        var index = this._indexByCid[cid];
        return this._views[index];
      },

      // Remove a view
      remove: function(view){
        var viewCid = view.cid;

        // get view index
        var viewIndex = this._indexByCid[viewCid];

        // delete cid index
        delete this._indexByCid[viewCid];

        // delete model index
        if (view.model){
          delete this._indexByModel[view.model.cid];
        }

        // delete custom index
        _.any(this._indexByCustom, function(index, key) {
          if (index === viewIndex) {
            delete this._indexByCustom[key];
            return true;
          }
        }, this);

        // remove the view from the container
        this._views.splice(viewIndex, 1);

        // update the length
        this._updateLength();

        // decrement the indices
        this._decrementIndices(viewIndex);
        return this;
      },

      // Call a method on every view in the container,
      // passing parameters to the call method one at a
      // time, like `function.call`.
      call: function(method){
        this.apply(method, _.tail(arguments));
      },

      // Apply a method on every view in the container,
      // passing parameters to the call method one at a
      // time, like `function.apply`.
      apply: function(method, args){
        _.each(this._views, function(view){
          if (_.isFunction(view[method])){
            view[method].apply(view, args || []);
          }
        });
      },

      // Update the `.length` attribute on this container
      _updateLength: function(){
        this.length = this._views.length;
      },

      // decrement indices after the removed one
      _decrementIndices: function(removedIndex){
        var decrementIndex = function (value, key, list) {
          if (removedIndex < value) {
            list[key]--;
          }
        };

        _.each(this._indexByCustom, decrementIndex);
        _.each(this._indexByCid, decrementIndex);
        _.each(this._indexByModel, decrementIndex);
      },

      // increment indices after the added one
      _incrementIndices: function(addedIndex){
        var incrementIndex = function (value, key, list) {
          if (addedIndex <= value) {
            list[key]++;
          }
        };

        _.each(this._indexByCustom, incrementIndex);
        _.each(this._indexByCid, incrementIndex);
        _.each(this._indexByModel, incrementIndex);
      }

    });

    // Borrowing this code from Backbone.Collection:
    // http://backbonejs.org/docs/backbone.html#section-106
    //
    // Mix in methods from Underscore, for iteration, and other
    // collection related features.
    var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
      'select', 'reject', 'every', 'all', 'some', 'any', 'include',
      'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
      'last', 'without', 'isEmpty', 'pluck'];

    _.each(methods, function(method) {
      Container.prototype[method] = function() {
        var views = _.values(this._views);
        var args = [views].concat(_.toArray(arguments));
        return _[method].apply(_, args);
      };
    });

    // return the public API
    return Container;
  })(Backbone, _);

  return Backbone.ChildViewContainer;

}));

describe("childview container", function(){

  describe("when providing an array of views to the constructor", function(){
    var container;

    beforeEach(function(){
      var views = [
        new Backbone.View(),
        new Backbone.View(),
        new Backbone.View()
      ]
      container = new Backbone.ChildViewContainer(views);
    });

    it("should add all of the views", function(){
      expect(container.length).toBe(3);
    });

  });

  describe("when adding a view that does not have a model to the container", function(){
    var container, view, foundView, indexView;

    beforeEach(function(){
      view = new Backbone.View();

      container = new Backbone.ChildViewContainer();

      container.add(view);

      foundView = container.findByCid(view.cid);
      indexView = container.findByIndex(0);
    });

    it("should make the view retrievable by the view's cid", function(){
      expect(foundView).toBe(view);
    });

    it("should make the view retrievable by numeric index", function(){
      expect(indexView).toBe(view);
    });

    it("should update the size of the chidren", function(){
      expect(container.length).toBe(1);
    });
  });

  describe("when adding a view that has a model, to the container", function(){
    var container, view, foundView, model;

    beforeEach(function(){
      model = new Backbone.Model();
      view = new Backbone.View({
        model: model
      });

      container = new Backbone.ChildViewContainer();

      container.add(view);

      foundView = container.findByModel(model);
    });

    it("should make the view retrievable by the model", function(){
      expect(foundView).toBe(view);
    });
  });

  describe("when adding a view with a custom index value", function(){
    var container, view, foundView;

    beforeEach(function(){
      view = new Backbone.View();

      container = new Backbone.ChildViewContainer();

      container.add(view, "custom indexer");

      foundView = container.findByCustom("custom indexer");
    });

    it("should make the view retrievable by the custom indexer", function(){
      expect(foundView).toBe(view);
    });
  });

  describe("when adding a view at a particular index", function(){
    var container, view, view2, cust, foundView;

    beforeEach(function(){
      var views = [
        new Backbone.View(),
        new Backbone.View(),
        new Backbone.View()
      ];

      cust = 'custom index';

      view = new Backbone.View();
      view2 = new Backbone.View();

      container = new Backbone.ChildViewContainer(views);

      container.add(view2, {customIndex: cust});
      container.add(view, {at: 2});

      foundView = container.findByIndex(2);
    });

    it("should make the view retrievable by the index", function(){
      expect(foundView).toBe(view);
    });

    it("should update the size of the chidren", function(){
      expect(container.length).toBe(5);
    });

    describe("and getting a view using a custom index", function(){
      it("should get the correct view", function(){
        var v = container.findByCustom(cust);
        expect(v).toBe(view2);
      });
    });

    describe("when adding at an index out of range", function(){
      beforeEach(function(){
        view = new Backbone.View();

        container.add(view, {at: 7});

        foundView = container.findByIndex(7);
      });

      it("should add to end of the container", function(){
        expect(foundView).toBe(undefined);
        expect(container.findByIndex(5)).toBe(view);
      })
    });
  });

  describe("when removing a view", function(){
    var container, view, view2, views, model, col, cust, cust2;

    beforeEach(function(){
      model = new Backbone.Model();
      cust = "custom indexer";
      cust2 = "another custom indexer";

      view = new Backbone.View({
        model: model
      });

      view2 = new Backbone.View({
        model: model
      });

      views = [
        new Backbone.View(),
        new Backbone.View(),
        new Backbone.View()
      ];

      container = new Backbone.ChildViewContainer(views);
      container.add(view, {customIndex: cust, at: 1});
      container.add(view2, {customIndex: cust2});

      container.remove(view);
    });

    it("should update the size of the chidren", function(){
      expect(container.length).toBe(4);
    });

    it("should update the indexes of the other views", function(){
      var v = container.findByIndex(2);
      expect(v).toBe(views[2]);
    });

    it("should remove the index by model", function(){
      var v = container.findByModel(model);
      expect(v).toBeUndefined();
    });

    it("should remove the index by custom", function(){
      var v = container.findByCustom(cust);
      expect(v).toBeUndefined();
    });

    it("should remove the view from the container", function(){
      var v = container.findByCid(view.cid);
      expect(v).toBeUndefined();
    });

    describe("and then getting a view by a custom index", function(){
      it("should get the correct view", function(){
        var v = container.findByCustom(cust2);
        expect(v).toBe(view2);
      });
    });
  });

  describe("adding or removing a view", function(){
    var container, view, model;

    beforeEach(function(){
      model = new Backbone.Model();

      view = new Backbone.View({
        model: model
      });

      container = new Backbone.ChildViewContainer();
    });

    it("should return itself when adding, for chaining methods", function(){
      expect(container.add(view)).toBe(container);
    });

    it("should return itself when removing, for chaining methods", function(){
      expect(container.remove(view)).toBe(container);
    });
  });

  describe("when a container has 2 views in it", function(){

    describe("and applying a method with parameters", function(){
      var container, v1, v2;

      beforeEach(function(){
        v1 = new Backbone.View();
        v1.someFunc = jasmine.createSpy("some func");

        v2 = new Backbone.View();
        v2.someFunc = jasmine.createSpy("some func");

        container = new Backbone.ChildViewContainer();
        container.add(v1);
        container.add(v2);

        container.apply("someFunc", ["1", "2"]);
      });

      it("should call that method on the first view", function(){
        expect(v1.someFunc).toHaveBeenCalledWith("1", "2");
      });

      it("should call that method on the second view", function(){
        expect(v2.someFunc).toHaveBeenCalledWith("1", "2");
      });
    });

    describe("and calling a method with parameters", function(){
      var container, v1, v2;

      beforeEach(function(){
        v1 = new Backbone.View();
        v1.someFunc = jasmine.createSpy("some func");

        v2 = new Backbone.View();
        v2.someFunc = jasmine.createSpy("some func");

        container = new Backbone.ChildViewContainer();
        container.add(v1);
        container.add(v2);

        container.call("someFunc", "1", "2");
      });

      it("should call that method on the first view", function(){
        expect(v1.someFunc).toHaveBeenCalledWith("1", "2");
      });

      it("should call that method on the second view", function(){
        expect(v2.someFunc).toHaveBeenCalledWith("1", "2");
      });
    });

    describe("and calling a method that doesn't exist on one of the views", function(){
      var container, v1, v2;

      beforeEach(function(){
        v1 = new Backbone.View();

        v2 = new Backbone.View();
        v2.someFunc = jasmine.createSpy("some func");

        container = new Backbone.ChildViewContainer();
        container.add(v1);
        container.add(v2);

        container.call("someFunc", "1", "2");
      });

      it("should call that method on the second view", function(){
        expect(v2.someFunc).toHaveBeenCalledWith("1", "2");
      });
    });

  });

  describe("iterators and collection functions", function(){
    var container, view, views;

    beforeEach(function(){
      views = [];
      view = new Backbone.View();

      container = new Backbone.ChildViewContainer();
      container.add(view);

      container.each(function(v, k){
        views.push(v);
      });
    });

    it("should provide a .each iterator", function(){
      expect(_.isFunction(container.each)).toBe(true);
    });

    it("should iterate the views with the .each function", function(){
      expect(views[0]).toBe(view);
    });

  });

});

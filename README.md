Push Pop Box
==========

This is a single page app to add, edit, and search notes. The front end is written in javascript with jQuery, Backbone and Twitter Bootstrap; the backend is Nodejs with express.

Here is the live demo: http://pushpopbox.cloudfoundry.com/

###This app illustrates the following practice in UI development:
1. **Separate presentation and model**
Use a MV-whatever library/framework, or write your own, to help separate view/controller logic from data model.
All communication with the backend should be done inside the model, and the model state should always be in-sync with the backend.
2. **Decoupling**
If object A knows about object B, then A can call methods on B, but B should not know about A. Instead A can listen to events from B. As shown in the digram below the solid arrows (method calls) go only in one direction. It makes sure there is no circular dependency.
If your app has lots of events between components, then create an EventBus, or leverage an event-driven framework like Twitter Flight. 
3. **Partial vs full render** If your view is a table or list of items, your may be tempted to create methods like "add", "remove" to insert/delete one item into/from the collection. Your code could easily bloat when you have to support sorting and pagination. So my advice is: simply re-render the whole view even when there is a partial change. What about performance? well if your collection is big, then your should do pagination anyway. Web developer: make sure your event handlers are delegated to the view's root element which does not change.

###How objects in this app interact
![Alt text](pushpopbox.png?raw=true)

PushPopBox = (function() {
  "use strict";

  var util = (function() {
    var $alertMsg = $('#alert-msg');

    return { 
      parseInt: function(str) {
        return parseInt(str, 10);
      },

      showAlert: function(msg, type) {
//        type || (type = 'info');
        $alertMsg.html(msg).show();
      },

      clearAlert: function() {
        $alertMsg.empty().hide();
      }
    };
  })(); 

  var model = _.extend({
    loadData: function() {
      this._items = [
        {id: 2, text: "TODO: Saving and loading data (backend), Add note with tags, Search&Tag", tags: [0]}, 
        {id: 1, text: "4266 Grange St\nBurnaby BC", tags: [1, 2]}, 
        {id: 0, text:  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec facilisis lacinia mi, ac faucibus elit condimentum ut. Aenean lacinia bibendum massa. Cras tincidunt tortor in sem luctus vel laoreet purus suscipit. In in odio sed lorem facilisis interdum. In condimentum varius libero, sit amet rhoncus massa tincidunt non. Fusce vehicula, sem nec facilisis feugiat, tellus ipsum venenatis risus, quis eleifend est diam in dolor. Donec id felis vitae ante dignissim mattis quis et sem. Vivamus dui metus, rhoncus consequat facilisis vitae, scelerisque vitae erat.", tags: [2]}
      ];

      this._tags = [
        {id: 0, text: 'todo',}, 
        {id: 1, text: 'personal',}, 
        {id: 2, text: 'misc'}
      ];

      this._nextItemId = this._items.length;
    },

    getItems: function() {
      return this._items;
    },

    getTags: function() {
      return this._tags;
    },

    getItemText: function(itemId) {
      var idx = this._getItemIdx(itemId);
      return this._items[idx].text;
    },

    searchItems: function(text) {
      text = text.toLowerCase();
      var matchedItems = _.filter(this._items, function(item) {
        return item.text.toLowerCase().indexOf(text) != -1;
      });
      return matchedItems;
    },

    filterItems: function(tagIds) {
      var matchedItems = _.filter(this._items, function(item) {
        return _.intersection(item.tags, tagIds).length == tagIds.length;
      });
      return matchedItems;
    },

    removeItem: function(itemId) {
      this._ajax('remove', itemId, function(response) {
        var idx = this._getItemIdx(itemId);
        this._items.splice(idx, 1);
        this.trigger('change:items');
      });
    },

    addItem: function(itemText) {
      this._ajax('add', itemText, function(response) {
        var id = this._getNextItemId();//should get id from response
        var item = {
          id: id,
          text: itemText
        };
        this._items.unshift(item);
        this.trigger('change:items');
      });
    },

    saveItem: function(itemId, itemText) {
      var item = {
        id: itemId,
        text: itemText
      };
      this._ajax('save', item, function(response) {
        var idx = this._getItemIdx(itemId);
        this._items[idx] = item;
        this.trigger('change:items');
      });
    },

    _getItemIdx: function(itemId) {
      for (var idx = 0; idx < this._items.length; ++idx) {
        if (this._items[idx].id == itemId) {
          return idx;
        }
      }
      return -1;
    },

    _getNextItemId: function() {
      return this._nextItemId++;
    },

    _ajax: function(action, data, callback) {
      //TODO: send action to the backend
      var response = {};
      callback && callback.call(this, response);
    }
  }, Backbone.Events);


  var SearchView = Backbone.View.extend({
    events: {
      'change .search-input':	'_search',
      'click .search-input-btn':	'_search'
    },

    initialize: function() {
      this._$input = this.$('.search-input');
    },

    _search: function() {
      this.trigger('search', $.trim(this._$input.val()));
    }
  });


  var TagsView = Backbone.View.extend({
    events: {
      'click .tag':	'_clickTag'
    },

    initialize: function() {
      this._selectedCssClass = 'label-warning';
      this.render();
    },

    render: function() {
      this.$el.html(this._tagsT({tags: model.getTags()}));
    },

    _clickTag: function(evt) {
      $(evt.currentTarget).toggleClass(this._selectedCssClass);
      this.trigger('filterByTags', this._getSelectedTags());
    },

    _getSelectedTags: function() {
      var tagIds = [];
      this.$('.' + this._selectedCssClass).each(function() {
        var tagId = util.parseInt($(this).attr('data-id'));
        tagIds.push(tagId);
      });
      return tagIds;
    },

    _tagsT: _.template(
      '<% _.each(tags, function(tag) { %>' +
        '<span class="tag label" data-id="<%- tag.id %>">' +
          '<%- tag.text %>' +
        '</span>'+
      '<% }); %>'
    )
  });


  var EditItemView = Backbone.View.extend({
    events: {
      'click .edit-action-save':	'_save',
      'click .edit-action-cancel':	'_cancel',
      'click .edit-action-delete':	'_remove'
    },

    initialize: function() {
      this._state = 'none';

      this._$editContent = this.$('.edit-item-content');
      this._$removeBtn = this.$('.edit-action-delete');

      var self = this;
      this._$addBtn = $('#add-btn').click(function() {
        self._add();
      });
    },

    startEdit: function(itemId) {
      if (this._state == 'none') {
        this._state = 'edit';
        this._itemId = itemId;
        var itemText = model.getItemText(itemId);
        this._$editContent.val(itemText);
        this._$removeBtn.removeAttr('disabled');
        this.$el.slideDown();
        this._$editContent.focus();
        this._$addBtn.attr('disabled', 'disabled');
        this.trigger('editing', itemId);
      } else {
        this._warn();
      }
    },

    _add: function() {
      if (this._state == 'none') {
        this._state = 'add';
        this._$editContent.val('');
        this._$removeBtn.attr('disabled', 'disabled');
        this.$el.slideDown();
        this._$editContent.focus();
        this._$addBtn.attr('disabled', 'disabled');
        this.trigger('adding');
      } else {
        this._warn();
      }
    },

    _warn: function(content) {
      util.showAlert('<strong>Warning</strong> Please save or cacnel your current edit first');
    },

    _save: function() {
      var text = this._$editContent.val();
      if (this._state == 'add') {
        model.addItem(text);
      } else {
        model.saveItem(this._itemId, text);
      }
      this._reset();
    },

    _cancel: function() {
      this._reset();
    },

    _remove: function() {
      model.removeItem(this._itemId);
      this._reset();
    },

    _reset: function() {
      this._state = 'none';
      this.$el.slideUp();
      this._$addBtn.removeAttr('disabled');
      this.trigger('done');
    }
  });



  var ItemsView = Backbone.View.extend({
    events: {
      'click .item-action':	'_edit'
    },

    initialize: function() {
      this.render();
      model.on('change:items', this.render, this);
    },

    render: function() {
      this._render(model.getItems());
    },

    highlight: function(itemId) {
      this.$el.addClass('deactive');
      if (itemId) {
        this.$('.item[data-item-id="' + itemId + '"]').first().addClass('highlight-item');
      }
    },

    clearHighlight: function() {
      this.$el.removeClass('deactive');
      this.$el.find('.highlight-item').removeClass('highlight-item');
    },

    search: function(text) {
      var matchedItems = model.searchItems(text);
      this._render(matchedItems);

      if (matchedItems.length == 0) {
        util.showAlert('No matching found.');
      }
    },

    clearSearch : function() {
      this.render();
      util.clearAlert();
    },

    filterByTags: function(tagIds) {
      var matchedItems = model.filterItems(tagIds);
      this._render(matchedItems);
    },

    _render: function(items) {
      this.$el.html(this._itemsT({items: items}));
      util.clearAlert();
    },

    _edit: function(evt) {
      var id = $(evt.currentTarget).attr('data-item-id');
      this.trigger('edit', id);
    },

    _itemsT: _.template(
      '<% _.each(items, function(item) { %>' +
        '<div class="item" data-item-id="<%= item.id %>">' +
          '<div class="item-content">' + 
            '<%- item.text %>' +
          '</div>' +
          '<div class="item-action" data-item-id="<%= item.id %>" title="edit">' +
            '<i class="icon-edit"></i>' +
          '</div>' + 
        '</div>' +
      '<% }); %>'
    )
  });

  var app = (function() {
    var searchView, 
      tagsView,
      editItemView,
      itemsView;

    var createViews = function() {
      searchView = new SearchView({el: '#search-view'});
      tagsView = new TagsView({el: '#edit-view .tags'});
      editItemView = new EditItemView({el: '#edit-view .edit-item'});
      itemsView = new ItemsView({el: '#items-view'});
    };

    var registerEvents = function() {
      searchView.on('search', function(text) {
        itemsView.search(text);
      });

      tagsView.on('filterByTags', function(tagIds) {
        itemsView.filterByTags(tagIds);
      });

      editItemView.on('editing', function(itemId) {
        itemsView.highlight(itemId);
      });

      editItemView.on('adding', function() {
        itemsView.highlight(null);
      });

      editItemView.on('done', function() {
        itemsView.clearHighlight();
      });

      itemsView.on('edit', function(itemId) {
        editItemView.startEdit(itemId);
      });
    };

    return {
      init: function() {
        model.loadData();
        createViews();
        registerEvents();
      }
    };
  })();

  return {
    init: app.init
  };
})();

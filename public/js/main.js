PPBox = {};

PPBox.util = (function() {

  var SPECIAL_CHARS = [
    //DONOT change the order
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
//    [' ', '&nbsp;'],
    ['\n', '<br>']
  ];

  return { 
    textToHtml: function(text) {
      var html = text;
      jQuery.each(SPECIAL_CHARS, function() {
        html = html.replace(new RegExp(this[0], 'g'), this[1]);
      });
      return html;
    },
    
    htmlToText: function(html) {
      var text = html;
      jQuery.each(SPECIAL_CHARS, function() {
        text = text.replace(new RegExp(this[1], 'g'), this[0]);
      });
      return text;
    }
  };
})(); 

PPBox.model = (function() {
  return {
    loadData: function() {
      this._items = [{
        id: 2,
        text: "TODO: tags, pagination, saving and loading (backend)",
      }, {
        id: 1,
        text: "908 - 4266 Grange St\nBurnaby V5H 1P1",
      }, {
        id: 0,
        text:  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec facilisis lacinia mi, ac faucibus elit condimentum ut. Aenean lacinia bibendum massa. Cras tincidunt tortor in sem luctus vel laoreet purus suscipit. In in odio sed lorem facilisis interdum. In condimentum varius libero, sit amet rhoncus massa tincidunt non. Fusce vehicula, sem nec facilisis feugiat, tellus ipsum venenatis risus, quis eleifend est diam in dolor. Donec id felis vitae ante dignissim mattis quis et sem. Vivamus dui metus, rhoncus consequat facilisis vitae, scelerisque vitae erat."
      }];

      this._nextItemId = this._items.length;
    },

    getItems: function() {
      return this._items;
    },

    searchItems: function(text) {
      var matchedItems = [];
      $.each(this._items, function() {
        if (this.text.toLowerCase().indexOf(text) != -1) {
          matchedItems.push(this);
        }
      });
      return matchedItems;
    },

    deleteItem: function(itemId) {
      var idx = this._getItemIdx(itemId);
      this._items.splice(idx, 1);
    },

    addItem: function(itemText) {
      var id = this._getNextItemId();
      var item = {
        id: id,
        text: itemText
      };
      this._items.splice(0, 0, item);
      return item;
    },

    saveItem: function(itemId, itemText) {
      var idx = this._getItemIdx(itemId);
      this._items[idx] = {
        id: itemId,
        text: itemText
      };
    },

    _getItemIdx: function(itemId) {
      var itemIdx = -1;
      $.each(this._items, function(idx) {
        itemIdx = idx;
        return this.id != itemId;
      });
      return itemIdx;
    },

    _getNextItemId: function() {
      return this._nextItemId++;
    },

    dummy: function() {
    }
  };
})(); 


PPBox.editView = (function() {
  var STATE_NONE = 0;
  var STATE_ADD = 1;
  var STATE_EDIT = 2;

  return {
    init: function() {
      this._state = STATE_NONE;

      this._jqContainer = $('.edit-item:first');
      this._jqEditContent = this._jqContainer.find('.edit-item-content:first');
      this._jqSave = this._jqContainer.find('.edit-action-save:first');
      this._jqCancel = this._jqContainer.find('.edit-action-cancel:first');
      this._jqDelete = this._jqContainer.find('.edit-action-delete:first');

      var self = this;
      this._jqSave.click(function() {
        self._save();
      });

      this._jqCancel.click(function() {
        self._cancel();
      });

      this._jqDelete.click(function() {
        self._delete();
      });
    },

    add: function() {
      if (this._state == STATE_NONE) {
        this._state = STATE_ADD;
        this._jqEditContent.val('');
        this._jqDelete.attr('disabled', 'disabled');
        this._jqContainer.show();
        this._jqEditContent.focus();
      } else {
        this._warn();
      }
    },

    edit: function(itemId) {
      if (this._state == STATE_NONE) {
        this._state = STATE_EDIT;
        this._itemId = itemId;
        var itemText = PPBox.view.getItemText(itemId);
        this._jqEditContent.val(itemText);
        this._jqDelete.removeAttr('disabled');
        this._jqContainer.show();
        this._jqEditContent.focus();
      } else {
        this._warn();
      }
    },

    _save: function() {
      var text = this._jqEditContent.val();
      if (this._state == STATE_ADD) {
        PPBox.view.addItem(text);
      } else {
        PPBox.view.saveItem(this._itemId, text);
      }
      this._reset();
    },

    _cancel: function() {
      this._reset();
    },

    _delete: function() {
      PPBox.view.deleteItem(this._itemId);
      this._reset();
    },

    _reset: function() {
      this._state = STATE_NONE;
      this._jqContainer.hide();
      PPBox.view.clearAlert();
    },

    _warn: function(content) {
      PPBox.view.warn('<strong>Warning</strong> Please save or cacnel your current edit first');
    },

    dummy: function() {
    }
  };
})();


PPBox.itemsView = (function() {
  return {

    init: function(model) {
      this._model = model;
      this._jqContainer = $('.items-section:first');

      this._addEventHandlers();
    },

    render: function() {
      this._render(this._model.getItems());
    },

    addItem: function(itemText) {
      var item = this._model.addItem(itemText);
      this._jqContainer.prepend(this._getItemTemplate(item));
    },

    saveItem: function(itemId, itemText) {
      this._model.saveItem(itemId, itemText);
      this._jqItemContent(itemId).html(PPBox.util.textToHtml(itemText));
    },

    deleteItem: function(itemId) {
      this._model.deleteItem(itemId);
      this._jqItem(itemId).remove();
    },

    getItemContent: function(itemId) {
      return this._jqItemContent(itemId).html();
    },

    search: function(text) {
      text = text.toLowerCase();
      var matchedItems = this._model.searchItems(text);
      this._render(matchedItems);

      PPBox.view.clearAlert();
      if (matchedItems.length == 0) {
        PPBox.view.info('No matching found.');
      }
    },

    clearSearch : function() {
      this.render();
      PPBox.view.clearAlert();
    },

    _render: function(items) {
      var html = [];
      var self = this;
      $.each(items, function() {
        html.push(self._getItemTemplate(this))
      });
      this._jqContainer.html(html.join(''));
    },

    _addEventHandlers: function() {
      this._jqContainer.click(function(evt) {
        var klass = evt.target.className;
        if (klass.indexOf('item-action-') != -1) {
          var id = klass.match(/[0-9]+/)[0];
          PPBox.view.editItem(id);
        }
      });
    },

    _jqItem: function(itemId) {
      return $('#item-' + itemId);
    },

    _jqItemContent: function(itemId) {
      return this._jqItem(itemId).find('.item-content:first');
    },

    _getItemTemplate: function(item) {
      var id = item.id;
      return ( 
        '<div class="item" id="item-' + id + '">' +
          '<div class="item-content">' + 
            PPBox.util.textToHtml(item.text) + 
          '</div>' +
          '<div class="item-action" title="edit">' +
            '<i class="icon-edit item-action-' + id + '"></i>' +
          '</div>' + 
        '</div>'
      );
    },

    dummy: function() {
    }
  };
})();

PPBox.view = (function() {
  return {

    init: function(model) {
      this._model = model;

      this._itemsView = PPBox.itemsView;
      this._itemsView.init(this._model);

      this._editView = PPBox.editView;
      this._editView.init();

      this._jqAlert = $('.alert-msg:first');
      this._jqSearchInput = $('#search-input');
      this._jqSearchClear = $('#search-clear');

      this._addEventHandlers();
    },

    _addEventHandlers: function() {
      var self = this;
      var jqAdd = $('#add');
      jqAdd.click(function() {
        self._editView.add();
      });

      var jqSearch = $('#search');
      jqSearch.click(function() {
        self._search();
      });

      this._jqSearchInput.change(function() {
        self._search();
      });

      this._jqSearchClear.click(function() {
        self._clearSearch();
      });
    },

    render: function() {
      this._itemsView.render();
    },

    getItemText: function(itemId) {
      return PPBox.util.htmlToText(this._itemsView.getItemContent(itemId));
    },

    editItem: function(itemId) {
      this._editView.edit(itemId);
    },

    deleteItem: function(itemId) {
      this._itemsView.deleteItem(itemId);
    },

    addItem: function(contentText) {
      this._itemsView.addItem(contentText);
    },

    saveItem: function(itemId, contentText) {
      this._itemsView.saveItem(itemId, contentText);
    },

    clearAlert: function() {
      this._jqAlert.html('').hide();
    },

    warn: function(content) {
//      this._jqAlert.removeClass('alert-info');
      this._jqAlert.html(content).show();
    },

    info: function(content) {
//      this._jqAlert.addClass('alert-info');
      this._jqAlert.html(content).show();
    },

    _search : function() {
      var searchText = this._jqSearchInput.val();
      this._itemsView.search(searchText);
    },

    _clearSearch : function() {
      this._jqSearchInput.val('');
      this._itemsView.clearSearch();
    },

    dummy : function() {
    }
  };
})();

PPBox.app = (function() {
  return {

    start: function() {
      this._loadModel();
      this._renderView();

    },

    _loadModel: function() {
      this._model = PPBox.model;
      this._model.loadData();
    },

    _renderView: function() {
      this._view = PPBox.view;
      this._view.init(this._model);
      this._view.render();
    },

    dummy: function() {
    }
  };
})();

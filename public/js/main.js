App = {};

App.util = (function() {

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

App.model = (function() {
  var _items;
  var _tags;
  var _nextItemId;

  var _getItemIdx = function(itemId) {
    var itemIdx = -1;
    $.each(_items, function(idx) {
      itemIdx = idx;
      return this.id != itemId;
    });
    return itemIdx;
  };

  var _getNextItemId = function() {
    return _nextItemId++;
  };

  var _contains = function(arr1, arr2) {
    var num_found = 0;
    $.each(arr2, function(idx2, v2) {
      $.each(arr1, function(idx, v1) {
        if (v1 == v2) {
          ++num_found;
          return false;
        }
      });
    });
    return num_found == arr2.length;
  };

  return {
    loadData: function() {
      _items = [{
        id: 2,
        text: "TODO: tags, pagination, saving and loading (backend)",
        tags: [0]
      }, {
        id: 1,
        text: "908 - 4266 Grange St\nBurnaby V5H 1P1",
        tags: [1, 2]
      }, {
        id: 0,
        text:  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec facilisis lacinia mi, ac faucibus elit condimentum ut. Aenean lacinia bibendum massa. Cras tincidunt tortor in sem luctus vel laoreet purus suscipit. In in odio sed lorem facilisis interdum. In condimentum varius libero, sit amet rhoncus massa tincidunt non. Fusce vehicula, sem nec facilisis feugiat, tellus ipsum venenatis risus, quis eleifend est diam in dolor. Donec id felis vitae ante dignissim mattis quis et sem. Vivamus dui metus, rhoncus consequat facilisis vitae, scelerisque vitae erat.",
        tags: [2]
      }];

      _tags = [{
        id: 0,
        text: 'todo',
      }, {
        id: 1,
        text: 'locked',
      }, {
        id: 2,
        text: 'misc'
      }];

      _nextItemId = _items.length;
    },

    getItems: function() {
      return _items;
    },

    searchItems: function(text) {
      var matchedItems = [];
      $.each(_items, function() {
        if (this.text.toLowerCase().indexOf(text) != -1) {
          matchedItems.push(this);
        }
      });
      return matchedItems;
    },

    filterItems: function(tagIds) {
      var matchedItems = [];
      $.each(_items, function() {
        if (_contains(this.tags, tagIds)) {
          matchedItems.push(this);
        }
      });
      return matchedItems;
    },

    deleteItem: function(itemId) {
      var idx = _getItemIdx(itemId);
      _items.splice(idx, 1);
    },

    addItem: function(itemText) {
      var id = _getNextItemId();
      var item = {
        id: id,
        text: itemText
      };
      _items.splice(0, 0, item);
      return item;
    },

    saveItem: function(itemId, itemText) {
      var idx = _getItemIdx(itemId);
      _items[idx] = {
        id: itemId,
        text: itemText
      };
    },

    getTags: function() {
      return _tags;
    },

    dummy: function() {
    }
  };
})(); 


App.editView = (function() {
  var STATE_NONE = 0;
  var STATE_ADD = 1;
  var STATE_EDIT = 2;

  var _state;
  var _itemId;

  var _jqNew;
  var _jqContainer;
  var _jqEditContent;
  var _jqSave;
  var _jqCancel;
  var _jqDelete;  

  var _reset = function() {
    _state = STATE_NONE;
//    _jqContainer.hide();
    _jqContainer.slideUp();
    _jqNew.removeAttr('disabled');
    App.view.doneEdit();
  };

  var _warn = function(content) {
    App.view.warn('<strong>Warning</strong> Please save or cacnel your current edit first');
  };

  var _save = function() {
    var text = _jqEditContent.val();
    if (_state == STATE_ADD) {
      App.view.addItem(text);
    } else {
      App.view.saveItem(_itemId, text);
    }
    _reset();
  };

  var _cancel = function() {
    _reset();
  };

  var _delete = function() {
    App.view.deleteItem(_itemId);
    _reset();
  };

  var _add = function() {
    if (_state == STATE_NONE) {
      _state = STATE_ADD;
      _jqEditContent.val('');
      _jqDelete.attr('disabled', 'disabled');
//      _jqContainer.show();
      _jqContainer.slideDown();
      _jqEditContent.focus();
      _jqNew.attr('disabled', 'disabled');
      App.view.highlight(null);
    } else {
      _warn();
    }
  };

  return {
    init: function() {
      _state = STATE_NONE;

      _jqNew = $('#new-btn');
      _jqContainer = $('.edit-item:first');
      _jqEditContent = _jqContainer.find('.edit-item-content:first');
      _jqSave = _jqContainer.find('.edit-action-save:first');
      _jqCancel = _jqContainer.find('.edit-action-cancel:first');
      _jqDelete = _jqContainer.find('.edit-action-delete:first');

      _jqSave.click(function() {
        _save();
      });

      _jqCancel.click(function() {
        _cancel();
      });

      _jqDelete.click(function() {
        _delete();
      });

      _jqNew.click(function() {
        _add();
      });
    },

    startEdit: function(itemId) {
      if (_state == STATE_NONE) {
        _state = STATE_EDIT;
        _itemId = itemId;
        var itemText = App.view.getItemText(itemId);
        _jqEditContent.val(itemText);
        _jqDelete.removeAttr('disabled');
        _jqContainer.slideDown();
        _jqEditContent.focus();
        _jqNew.attr('disabled', 'disabled');
        App.view.highlight(itemId);
      } else {
        _warn();
      }
    },

    dummy: function() {
    }
  };
})();
this.

App.itemsView = (function() {
  var _model;
  var _jqContainer;

  var _render = function(items) {
    var html = [];
    $.each(items, function() {
      html.push(_getItemTemplate(this))
    });
    _jqContainer.html(html.join(''));

    App.view.clearAlert();
  };

  var _addEventHandlers = function() {
    _jqContainer.click(function(evt) {
      var klass = evt.target.className;
      if (klass.indexOf('item-action-') != -1) {
        var id = klass.match(/[0-9]+/)[0];
        App.view.editItem(id);
      }
    });
  };

  var _jqItem = function(itemId) {
    return $('#item-' + itemId);
  };

  var _jqItemContent = function(itemId) {
    return _jqItem(itemId).find('.item-content:first');
  };

  var _getItemTemplate = function(item) {
    var id = item.id;
    return ( 
      '<div class="item" id="item-' + id + '">' +
        '<div class="item-content">' + 
          App.util.textToHtml(item.text) + 
        '</div>' +
        '<div class="item-action" title="edit">' +
          '<i class="icon-edit item-action-' + id + '"></i>' +
        '</div>' + 
      '</div>'
    );
  };


  return {

    init: function(model) {
      _model = model;
      _jqContainer = $('.items-section:first');

      _addEventHandlers();
    },

    render: function() {
      _render(_model.getItems());
    },

    addItem: function(itemText) {
      var item = _model.addItem(itemText);
      _jqContainer.prepend(_getItemTemplate(item));
    },

    saveItem: function(itemId, itemText) {
      _model.saveItem(itemId, itemText);
      _jqItemContent(itemId).html(App.util.textToHtml(itemText));
    },

    deleteItem: function(itemId) {
      _model.deleteItem(itemId);
      _jqItem(itemId).remove();
    },

    highlight: function(itemId) {
      _jqContainer.addClass('deactive');
      if (itemId) {
        _jqItem(itemId).addClass('highlight-item');
      }
    },

    clearHighlight: function() {
      _jqContainer.removeClass('deactive');
      _jqContainer.find('.highlight-item').removeClass('highlight-item');
    },

    getItemContent: function(itemId) {
      return _jqItemContent(itemId).html();
    },

    search: function(text) {
      text = text.toLowerCase();
      var matchedItems = _model.searchItems(text);
      _render(matchedItems);

      if (matchedItems.length == 0) {
        App.view.info('No matching found.');
      }
    },

    clearSearch : function() {
      this.render();
      App.view.clearAlert();
    },

    filterByTags: function(tagIds) {
      var matchedItems = _model.filterItems(tagIds);
      _render(matchedItems);
    },

    dummy: function() {
    }
  };
})();

App.tagsView = (function() {
  var CLASS_SELECTED = 'label-warning';

  var _model;
  var _jqContainer;

  var _render = function(tags) {
    var html = [];
    $.each(tags, function() {
      html.push(_getTagTemplate(this))
    });
    _jqContainer.html(html.join(''));
  };

  var _getSelectedTags = function(tags) {
    var tagIds = [];
    _jqContainer.find('.' + CLASS_SELECTED).each(function() {
        var tagId = this.id.match(/[0-9]+/)[0];
        tagIds.push(tagId);
    });
    return tagIds;
  };

  var _addEventHandlers = function() {
    _jqContainer.click(function(evt) {
      var elt = evt.target;
      if (elt.className.indexOf('tag') != -1) {
        $(elt).toggleClass(CLASS_SELECTED);
        App.view.filterByTags(_getSelectedTags());
      }
    });
  };

  var _getTagTemplate = function(tag) {
    var id = tag.id;
    return ( 
        '<span class="tag label" id="tag-' + id + '">' +
        //          '<div class="tag-content">' + 
        //TODO
        //            App.util.textToHtml(tag.text) + 
        tag.text +
        //          '</div>' +
        '</span>'
        );
  };

  return {

    init: function(model) {
      _model = model;
      _jqContainer = $('.tags:first');

      _addEventHandlers();
    },

    render: function() {
      _render(_model.getTags());
    },

    dummy: function() {
    }
  };
})();

App.topInputView = (function() {
  var _jqInput;
  var _jqInputBtn;

  var _search = function() {
    var searchText = _jqInput.val();
    _itemsView.search(searchText);
  };

  var _clearSearch = function() {
    _jqInput.val('');
    _itemsView.clearSearch();
  };

  return {

    init: function() {
      _jqInput = $('#top-input');
      _jqInputBtn = $('#top-input-btn');

      _jqInputBtn.click(function() {
        _search();
      });

      _jqInput.change(function() {
        _search();
      });
    },

    dummy: function() {
    }
  };
})();


App.view = (function() {
  var _model;
  var _itemsView;
  var _tagsView;
  var _editView;

  var _jqAlert;

  return {

    init: function(model) {
      _model = model;

      _topInput = App.topInputView;
      _topInput.init();

      _itemsView = App.itemsView;
      _itemsView.init(_model);

      _tagsView = App.tagsView;
      _tagsView.init(_model);

      _editView = App.editView;
      _editView.init();

      _jqAlert = $('.alert-msg:first');
    },

    render: function() {
      _itemsView.render();
      _tagsView.render();
    },

    getItemText: function(itemId) {
      return App.util.htmlToText(_itemsView.getItemContent(itemId));
    },

    editItem: function(itemId) {
      _editView.startEdit(itemId);
    },

    highlight: function(itemId) {
      _itemsView.highlight(itemId);
    },

    deleteItem: function(itemId) {
      _itemsView.deleteItem(itemId);
    },

    addItem: function(contentText) {
      _itemsView.addItem(contentText);
    },

    saveItem: function(itemId, contentText) {
      _itemsView.saveItem(itemId, contentText);
    },

    clearAlert: function() {
      _jqAlert.html('').hide();
    },

    doneEdit: function() {
//      this.clearAlert();
      _itemsView.clearHighlight();
    },

    warn: function(content) {
//      _jqAlert.removeClass('alert-info');
      _jqAlert.html(content).show();
    },

    info: function(content) {
//      _jqAlert.addClass('alert-info');
      _jqAlert.html(content).show();
    },

    filterByTags: function(tagIds) {
      _itemsView.filterByTags(tagIds);
    },

    dummy : function() {
    }
  };
})();

App.main = (function() {
  var _model;

  var _loadModel = function() {
    _model = App.model;
    _model.loadData();
  };

  var _renderView = function() {
    _view = App.view;
    _view.init(_model);
    _view.render();
  };

  return {

    run: function() {
      _loadModel();
      _renderView();
    }
  };
})();

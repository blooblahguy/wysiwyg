

(function ($) {
	$.fn.atlas = function(custom_options) {
		/**
		 * Creates the default options and objects
		 * @function atlas
		 * @param custom_options
		 * @returns @public atlas - public object of atlas and functions
		 */
		var atlas = $(this)
		atlas.states = {}
		atlas.keybinds = {}
		atlas.toolbar = {}

		// private object
		var private = {}
		private.buttons = {}

		// setup default options
		var default_options = {
			toolbar: ['bold', 'italic', 'underline', 'strikethrough', 'textcolor', '|', 'formatting', 'alignment', 'numberlist', 'bulletlist', 'leftindent', 'rightindent', 'quote', '|', 'link', 'image', 'table', '|', 'emoticons', 'hr', 'clearformatting', '|', 'html', 'bold']
			, autoLink: true
			, loadCSS: true
			, customClass: ''
			, autofocus: true
			, spellcheck: true
			, characterCount: true
			, characterCountMax: false
			, height: 200
			, heightMin: 100
			, heightMax: 500
			, linkAlwaysBlank: true
			, linkAlwaysNoFollow: false
			, onChange: false
			, onFocus: false
			, onBlur: false
			, customPlugins: {}
		}
		var options = $.extend({}, default_options, custom_options);
		var debug = console.log.bind(window.console, '%s')

		/**
		 * @public @function RegisterButton
		 * @param key : Unique key of the button command that can be called
		 * @param settings : Settings to overwrite default settings
		 */
		atlas.RegisterButton = function(key, settings = {}) {
			// unique key
			if (private.buttons[key]) {
				debug("Command ", key, "already exists. Can't add new command.");
				return;
			}

			// defaults
			var defaults = {
				label: key
				, type: "button"
				, icon: false
				, keybind: false
				, mobile: true
				, options: false
				, html: false

				, command: false
				, active: false

				, OnShow: false
				, OnHide: false
			}

			// merge together defaults and custom
			var button = $.extend(defaults, settings);

			if (type == "button") {

			} else if (type == "dropdown") {

			}

			private.buttons[key] = button

			return button
		}

		/**
		 * @private @function OnClick
		 * Handles clicks on the buttons and instance to make sure focus is correct
		 */
		private.OnClick = function() {

		}

		/**
		 * @private @function OnClipboard
		 * Handles key events to fire the correct commands
		 */
		private.OnClipboard = function(ev) {
			var html = atlas.html_viewer.val()
			atlas.editor.html(html)
		}

		/**
		 * @private @function OnKey
		 * Handles key events to fire the correct commands
		 */
		private.OnKey = function(ev) {
			var e = ev.originalEvent
			var key = e.key.toLowerCase()

			if (ev.type == "keyup") {
				// always keep lines wrapped in a tag
				if (! atlas.isWrapped() && ! atlas.getLineHTML() == "") {
					document.execCommand('formatBlock', false, 'p')
				}
			}
			if (ev.type == "keydown") {
				// debug(key, ev)
				// this isn't actually a key, just a modifer, let's get out of here
				if (key == "shift" || key == "alt" || key == "control") {return;}

				// modifiers
				atlas.ctrl = e.ctrlKey ? 'ctrl+' : ''
				atlas.shift = e.shiftKey ? 'shift+' : ''
				atlas.alt = e.altKey ? 'alt+' : ''

				// keybind combo checker (order matters here, needs to match what we map inside of toolbar setup)
				var keybindFriendly = ""+atlas.ctrl+atlas.shift+atlas.alt+key
				if (atlas.keybinds[keybindFriendly]) {
					var button = atlas.keybinds[keybindFriendly]
					// private.exec(button);
					
					// don't let browser keybinds take over and double call the toggle
					ev.preventDefault();
					return false;
				}

				// double enters clear blank line formatting
				if (key == "enter" && ! atlas.isContainedBy("P") && atlas.getLineHTML() == "") {
					document.execCommand('formatBlock', false, 'p')

					e.preventDefault()
					return false;
				}

				// autolinking, find unlinked anchor tags and html wrap them
				if (key == "enter" || e.code == "Space") {

					var selection = window.getSelection();
					var range = selection.getRangeAt(0);
				}
			}

			// sync html to our original fields and html editor
			var html = $(this).html()
			atlas.text(html)
			atlas.html_viewer.val(html)

			// Call plugin and button refresh states
			private.Refresh()
		}

		/**
		 * @private @function Refresh
		 * Handles refresh on all button elements
		 */
		private.Refresh = function() {
			// button refreshes
			$.each(private.buttons, function(key, button) {
				if (button.active && button.html) {
					button.refresh(atlas, button.html)
				}
			});
		}

		/**
		 * @private @function Exec
		 * Execution wrapper to use commands and use correct callback functions
		 */
		private.Exec = function(command, commandValue) {
			var caret_pos = atlas.getCaretPosition()
			console.log(caret_pos);

			// button command run
			// if (typeof command === "function") {
			// 	[command, commandValue] = command(atlas, command, commandValue)
			// }

			// run the document command
			if (command) {
				console.log(command, commandValue)
				// document.designMode = 'on'
				console.log(document.execCommand(command, false, commandValue));
				// document.designMode = 'off'
			}

			// private.refresh()
			// atlas.editor.focus()
		}

		/**
		 * @private @function CreateInstance()
		 * Creates the editor HTML for the given dom object
		 */
		private.CreateInstance = function() {
			atlas.parent = $('<div class="atlas_wysiwyg'+options.customClass+'" role="application"></div>').insertBefore(atlas)
			atlas.toolbar = $('<div class="atlas_toolbar">').appendTo(atlas.parent)
			atlas.wrapper = $('<div class="atlas_wrapper">').appendTo(atlas.parent)
			atlas.editor = $('<div class="atlas_editor" contenteditable="true" arial-disabled="false" placeholder="Type something" spellcheck="'+options.spellcheck+'">').appendTo(atlas.wrapper)
			atlas.html_viewer = $('<textarea class="atlas_raw_html" style="display:none;" arial-disabled="false" placeholder="Type something" spellcheck="false"></textarea>').appendTo(atlas.wrapper)

			atlas.editor.css("min-height", options.heightMin)
			atlas.editor.css("max-height", options.heightMax)
			atlas.editor.css("height", options.height)

			if (options.autofocus) {
				atlas.editor.focus()
			}
		}

		/**
		 * @private @function Initiate
		 * Loads the extension
		 */
		private.Initiate = function() {
			atlas.hide()

			// editor defaults
			document.execCommand("defaultParagraphSeparator", false, "p");
			document.execCommand("insertBrOnReturn", false, false);

			private.CreateInstance() // create editor instance html
			private.buildToolbar() // creates toolbar from created plugins
			private.hookKeybinds() // keyboard eventer

			atlas.editor[0].onpointerup = private.Refresh // only this actually captures the new pointer location, unlike anything else?
			// atlas.parent.on("mousedown mouseup click", OnClick.buttonHandler)  // captures clicks on the wrapper, determines what to do
			atlas.parent.on("mousedown mouseup click", private.OnClick)  // captures clicks on the wrapper, determines what to do
			atlas.html_viewer.on("keydown keyup cut paste", private.OnClipboard)  // captures clicks on the wrapper, determines what to do
			atlas.editor.on("keydown keyup", private.OnKey)  // captures clicks on the wrapper, determines what to do

			// atlas.parent.on("", private.OnKey)  // captures clicks on the wrapper, determines what to do
		}

		// DROPDOWN FUNCTIONALITY
		private.dropdowns = {}
		atlas.hideDropdowns = function(key) {
			if (typeof key === "string") {
				$(".atlas_dropdown").not("#dropdown_"+key).removeClass("dropdown_active")
				$(".atlas_dropdown_button").not("#"+key).removeClass("dropdown_active")
			} else {
				$(".atlas_dropdown").removeClass("dropdown_active")
				$(".atlas_dropdown_button").removeClass("dropdown_active")
			}
		}
		atlas.toggleDropdown = function(key) {
			var dropdown = private.dropdowns[key].html
			var button = private.buttons[key].html
			var position = button.position()
			dropdown.show = dropdown.hasClass("dropdown_active") ? false : true;

			if (dropdown.show) {
				dropdown.addClass("dropdown_active")
				button.addClass("dropdown_active")
				dropdown.css({
					top: position.top + button.outerHeight()
					, left: position.left
				})
			} else {
				dropdown.removeClass("dropdown_active")
				button.removeClass("dropdown_active")
			}
		}
		atlas.addDropdown = function(key, dropdown_settings) {
			var dropdown_defaults = {
				icon: ''
				, label: key
				, keybind: ''
				, options: false
				, command: false
				, refresh: false
			}
			var dropdown = $.extend(dropdown_defaults, dropdown_settings);
			
			// give dropdown a button
			dropdown.button = atlas.addButton(key, {
				icon: dropdown.icon
				, label: dropdown.label
				, keybind: dropdown.keybind
				, refresh: dropdown.refresh
				, customClass: "atlas_dropdown_button"
				, command: function(atlas, command, commandValue) {
					atlas.toggleDropdown(key)
					
					return [false, false]
				}
			});

			// create dropdown html
			dropdown.wrapper = $('<div id="dropdown_'+key+'" class="atlas_dropdown '+key+'" role="listbox" aria-hidden="true"></div>');

			// allow function html generation
			if (dropdown.html && typeof dropdown.html === "function") {
				dropdown.html = dropdown.html()
			}
			if (dropdown.html) {
				$(dropdown.html).appendTo(dropdown.wrapper)
			} else if (dropdown.options) {
				dropdown.ul = $('<ul class="dropdown-list" role="presentation"></ul>').appendTo(dropdown.wrapper);
				
				$.each(dropdown.options, function(command, label) {
					var button = private.buttons[command]
					var li = $('<li class="atlas_dropdown_item"></li>').appendTo(dropdown.ul)
					dropdown.button.html = $(button.template).appendTo(li)
				});
			}

			// store and return
			dropdown.html = dropdown.wrapper
			private.dropdowns[key] = dropdown
			return dropdown
		}

		// BUTTON FUNCTIONALITY
		/**
		 * arguments key, options
		 * options:
		 * icon: (default false) glyphname of button icon, if false, label is populated in html
		 * label: (default key) tooltip label for button
		 * keybind: (default '') keybind shortcut for button
		 * addClass: (default '') add custom class to button
		 * command: (default false) Runs first to create command & commandValue
		 * refresh: (default false) Runs if button state could have changed
		 */
		private.buttons = {}
		atlas.addButton = function(key, button_settings = {}) {
			// button_settings = button_settings[0]
			// plugin already exists
			if (private.buttons[key]) {
				debug("Button with key: "+key+" already exists! Button keys must be unique."); 
				return;
			}

			var button_defaults = {
				icon: false
				, label: key
				, keybind: ''
				, customClass: ''
				, command: false
				, refresh: false
			}

			var button = $.extend(button_defaults, button_settings);

			if (key == "atlas_separator") {
				button.template = '<div class="atlas_separator" role="serarator" aria-orientation="vertical"></div>'
			} else if (key == "atlas_newtoolbar") {
				button.template = '<div class="atlas_break clear" role="break"></div>'
			} else {
				button.template = '<button id="'+key+'" class="atlas_command atlas_btn atlas_'+key+' '+button.customClass+'" data-cmd="'+key+'" tabindex="-1" role="button" type="button" data-glyph="'+button.icon+'" title="'+button.label+' '+button.keybind+'">'+(button.icon === false ? button.label : '')+'</button>';
			}

			// default refresh function if this is just a native command
			if (! button.refresh && typeof button.command === "string") {
				// automatically create refresh state if it doesn't exist
				button.refresh = function(atlas, btn) {
					if (document.queryCommandState(button.command)) {
						btn.addClass("active")
					} else {
						btn.removeClass("active")
					}
				}
			}

			private.buttons[key] = button
			return button
		}

		// DEFAULT TOOLBAR BUTTONS


		// primaryfunction
		private.init = function() {
			
		}

		

		// Builds editor toolbar and instantiates plugins
		private.buttonHandler = function(ev, e) {

			// allow any html type to act like a button and not steal focus
			var key = $(ev.target).data("cmd")
			if (ev.type == "click") {
				if (typeof key === "string") {
					atlas.hideDropdowns(key)
					var button = private.buttons[key]
					private.exec(button)
				} else {
					atlas.hideDropdowns()
				}
			} else {
				if (typeof key === "string") {
					ev.stopImmediatePropagation()
					ev.preventDefault()
					ev.stopPropagation();

					return false
				}
			}
		}
		private.buildToolbar = function() {
			$.each(options.toolbar, function(i, e) {
				if (e == "|") { e = "atlas_separator"}
				if (e == "_") { e = "atlas_newtoolbar"}

				// don't register toolbar buttons that don't exist
				if (! private.buttons[e]) {
					debug("Toolbar attempted to use button "+e+" but no such button exists.");
					return true;
				}

				debug(e, private.buttons[e])

				var button = private.buttons[e]
				var binds = $.map(button.keybind.toLowerCase().split("+"), $.trim);
				var parsedBind = ''

				// parse modifiers into correct format and order
				if (binds.indexOf('ctrl') >= 0 || binds.indexOf('control') >= 0 ) {
					parsedBind += 'ctrl+'
					binds.splice(binds.indexOf('ctrl'), 1)
				}
				if (binds.indexOf('shift') >= 0 ) {
					parsedBind += 'shift+'
					binds.splice(binds.indexOf('shift'), 1)
				}
				if (binds.indexOf('alt') >= 0 ) {
					parsedBind += 'alt+'
					binds.splice(binds.indexOf('alt'), 1)
				}
				parsedBind += binds.join("+")

				// Send out html
				button.html = $(button.template).appendTo(atlas.toolbar)

				// register with keybinder and click events
				if (parsedBind) {
					atlas.keybinds[parsedBind] = button
				}

				// this is also a dropdown button
				if (private.dropdowns[e]) {
					var dropdown = private.dropdowns[e]
					button.dropdown = $(dropdown.html).appendTo(atlas.toolbar)
				}

				// extend
				private.buttons[e] = button
			})

			// One click handler to rule them all. This lets us assign commands to arbitrary things
			// button.click = 
		}

		// helpers
		atlas.isContainedBy = function(tag) {
			var nodeParents = atlas.returnNodeAncestors();
			atlas.states.currentParents = nodeParents

			if (atlas.states.currentParents.indexOf(tag) >= 0) {
				return true
			} else {
				return false
			}
		}
		atlas.isWrapped = function() {
			return atlas.isParagraph() || atlas.isHeader() || atlas.isQuote()
		}
		atlas.isHeader = function() {
			return atlas.isContainedBy("H1") || atlas.isContainedBy("H2") || atlas.isContainedBy("H3") || atlas.isContainedBy("H4") || atlas.isContainedBy("H5") || atlas.isContainedBy("H6")
		}
		atlas.isParagraph = function() {
			return atlas.isContainedBy("P")
		}
		atlas.isLink = function() {
			return atlas.isContainedBy("A")
		}
		atlas.isQuote = function() {
			return atlas.isContainedBy("BLOCKQUOTE")
		}
		atlas.isList = function(type = false) {
			if (type == "ordered") {
				return document.queryCommandState("insertOrderedList");
			} else if (type == "unordered") {
				return document.queryCommandState("insertUnorderedList");
			} else {
				return document.queryCommandState("insertOrderedList") ? true : document.queryCommandState("insertUnorderedList");
			}
		}
		atlas.isBold = function() {
			return document.queryCommandState("bold");
		}
		atlas.isItalic = function() {
			return document.queryCommandState("italic");
		}
		atlas.isUnderline = function() {
			return document.queryCommandState("underline");
		}
		atlas.isStrikeThrough = function() {
			return document.queryCommandState("strikeThrough");
		}
		atlas.isAlignedLeft = function() {
			return document.queryCommandState("justifyLeft");
		}
		atlas.isAlignedCenter = function() {
			return document.queryCommandState("justifyCenter");
		}
		atlas.isAlignedRight = function() {
			return document.queryCommandState("justifyRight");
		}

		atlas.getCaretPosition = function() {
			var element = atlas.editor[0]
			var caret = 0
			if (typeof window.getSelection != "undefined") {
				var range = window.getSelection().getRangeAt(0);
				var preCaretRange = range.cloneRange();
				preCaretRange.selectNodeContents(element);
				preCaretRange.setEnd(range.endContainer, range.endOffset);
				caret = preCaretRange.toString().length;
			} else  if (typeof document.selection != "undefined" && document.selection.type != "Control") {
				var textRange = document.selection.createRange();
				var preCaretTextRange = document.body.createTextRange();
				preCaretTextRange.moveToElementText(element);
				preCaretTextRange.setEndPoint("EndToEnd", textRange);
				caret = preCaretTextRange.text.length;
			}

			return caret
		}

		atlas.returnNodeAncestors = function() {
			var node = null; 
			node = window.getSelection().getRangeAt(0).commonAncestorContainer
			node = node.nodeType === 1 ? node : node.parentNode;
			var nodeArray = [];
			returnarray = returnParentTag(node, nodeArray);

			return returnarray;
		}

		// recursive element finding
		function returnParentTag(elem, nodeArray) {
			if (elem) {
				nodeArray.push(elem.tagName);
				if (elem.id != "editor") {
					var next = returnParentTag(elem.parentNode, nodeArray);
					if (next) {return next;}
				}
			}
			return nodeArray;
		}
		function getTextNodesIn(node) {
			var textNodes = [];
			if (node.nodeType == 3) {
				textNodes.push(node);
			} else {
				var children = node.childNodes;
				for (var i = 0, len = children.length; i < len; ++i) {
					textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
				}
			}
			return textNodes;
		}
		atlas.getLineHTML = function() {
			var selection = window.document.selection, range, oldBrowser = true;

			if (! selection) {
				selection = window.getSelection();
				range = selection.getRangeAt(0);
				oldBrowser = false;
			} else {
				range = document.selection.createRange();
			}

			selection.modify("move", "backward", "lineboundary");
			selection.modify("extend", "forward", "lineboundary");

			if (oldBrowser) {
				var html = document.selection.createRange().htmlText;
				range.select();
				return html;
			}

			var html = document.createElement("div");

			for (var i = 0, len = selection.rangeCount; i < len; ++i) {
				html.appendChild(selection.getRangeAt(i).cloneContents());
			}

			selection.removeAllRanges();
			selection.addRange(range);

			return html.innerHTML;
		}
		atlas.selectRange = function(start, end) {
			var el = atlas.editor[0]
			var selection

			if (document.createRange && window.getSelection) {
				var range = document.createRange();
				range.selectNodeContents(el);
				var textNodes = getTextNodesIn(el);
				var foundStart = false;
				var charCount = 0, endCharCount;

				for (var i = 0, textNode; textNode = textNodes[i++]; ) {
					endCharCount = charCount + textNode.length;
					if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i <= textNodes.length))) {
						range.setStart(textNode, start - charCount);
						foundStart = true;
					}
					if (foundStart && end <= endCharCount) {
						range.setEnd(textNode, end - charCount);
						break;
					}
					charCount = endCharCount;
				}

				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			} else if (document.selection && document.body.createTextRange) {
				selection = document.body.createTextRange();
				selection.moveToElementText(el);
				selection.collapse(true);
				selection.moveEnd("character", end);
				selection.moveStart("character", start);
				selection.select();
			}

			return selection
		}
		atlas.deleteSelection = function() {
			var selection = window.getSelection ? window.getSelection() : document.selection;

			if (selection) {
				if (selection.removeAllRanges) { 
					selection.removeAllRanges();
				} else {
					selection.empty();
				}
			}

			atlas.editor.focus()
		}
		atlas.getSelection = function() {
			return window.getSelection ? window.getSelection() : document.selection;
		}
		atlas.getSelectionValue = function() {
			if (window.getSelection) {
				return window.getSelection().focusNode.nodeValue;
			} else {
				return document.selection.focusNode.nodeValue
			}
		}

		// range/caret functions
		atlas.moveCaret = function(point) {
			var range = document.createRange();
			var sel = window.getSelection();
			sel.removeAllRanges();
		}

		atlas.moveToEnd = function() {
			var range = document.createRange();
			var sel = window.getSelection();
			range.selectNodeContents(atlas.editor[0]);
			range.collapse(false);
			sel.removeAllRanges();
			sel.addRange(range);
			atlas.editor.focus();
			range.detach(); // optimization

			// set scroll to the end if multiline
			atlas.editor.scrollTop = atlas.editor.scrollHeight; 
		}

		//===========================================
		// EDITOR EVENTS
		//===========================================
		private.hookKeybinds = function() {
			
		}

		// tracking document command states
		// private.canCommand = function(command) {
		// 	return document.queryCommandSupported(command) ? true : document.queryCommandEnabled(command);
		// }

		private.refresh = function() {
			// button refreshes
			$.each(private.buttons, function(key, button) {
				if (button.refresh && button.html) {
					button.refresh(atlas, button.html)
				}
			});
		}

		//===========================================
		// MAIN COMMAND FUNCTION
		//===========================================
		private.exec = function(button) {
			var command = button.command
			var commandValue = false

			var caret_pos = atlas.getCaretPosition()
			console.log(caret_pos);

			// button command run
			if (typeof button.command === "function") {
				[command, commandValue] = button.command(atlas, command, commandValue)
			}

			// run the document command
			if (command) {
				console.log(command, commandValue)
				// document.designMode = 'on'
				console.log(document.execCommand(command, false, commandValue));
				// document.designMode = 'off'
			}

			private.refresh()
			atlas.editor.focus()
		}

		/**
		 * Load All Default Plugins
		 */
		atlas.RegisterButton("bold", {
			keybind: "ctrl+b"
			, command: function() {
				private.Exec(command, commandValue)
			}
			, active: function() {
				return document.queryCommandState("bold");
			}
		})
		
		
		//===========================================
		// INITIATE THEN RETURN
		//===========================================
		private.init()
		return atlas;
	}
}( jQuery ));
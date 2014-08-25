ztrans_split = function(text) 
{
	var split_regex = /(<!--.*?-->)/gi;
	var lang_begin_regex = /<!--:([a-z]{2})-->/gi;
	var lang_end_regex = /<!--:-->/gi;
	var morenextpage_regex = /(<!--more-->|<!--nextpage-->)+$/gi;
	var matches = null;
	var result = new Object;
	var matched = false;
	for (var i=0; i<zTranslateConfig.enabled_languages.length; i++)
	{
		var language=zTranslateConfig.enabled_languages[i];
		result[language] = '';
	}
	var blocks = text.xsplit(split_regex);
	if(ztrans_isArray(blocks)) 
	{
		for (var i = 0;i<blocks.length;i++) 
		{
			if((matches = lang_begin_regex.exec(blocks[i])) != null)
			{
				matched = matches[1];
			} 
			else if(lang_end_regex.test(blocks[i])) 
			{
				matched = false;
			}
			else 
			{
				if(matched) 
				{
					result[matched] += blocks[i];
				}
				else 
				{
					for (var j=0; j<zTranslateConfig.enabled_languages.length; j++)
					{
						var language=zTranslateConfig.enabled_languages[j];
						result[language] += blocks[i];
					}
				}
			}
		}
	}
	for (var i = 0;i<result.length;i++) {
		result[i] = result[i].replace(morenextpage_regex,'');
	}
	return result;
}

ztrans_integrate = function(lang, lang_text, text) {

	var texts = ztrans_split(text);
	var moreregex = /<!--more-->/i;
	var text = '';
	var max = 0;
	var morenextpage_regex = /(<!--more-->|<!--nextpage-->)+$/gi;
	
	texts[lang] = lang_text;
	for (var i=0; i<zTranslateConfig.enabled_languages.length; i++)
	{
		var language=zTranslateConfig.enabled_languages[i];
		texts[language] = texts[language].split(moreregex);
		if(!ztrans_isArray(texts[language])) {
			texts[language] = [texts[language]];
		}
		if(max < texts[language].length) max = texts[language].length;
	}
	for(var i=0; i<max; i++) 
	{
		if(i >= 1) 
		{
			text += '<!--more-->';
		}
		for (var j=0; j<zTranslateConfig.enabled_languages.length; j++)
		{
			var language=zTranslateConfig.enabled_languages[j];
			if(texts[language][i] && texts[language][i]!='')
			{
				text += '<!--:'+language+'-->';
				text += texts[language][i];
				text += '<!--:-->';
			}
		}
	}
	text = text.replace(morenextpage_regex,'');
	return text;
}

String.prototype.xsplit = function(_regEx){
	// Most browsers can do this properly, so let them — they'll do it faster
	if ('a~b'.split(/(~)/).length === 3) { return this.split(_regEx); }

	if (!_regEx.global)
	{ _regEx = new RegExp(_regEx.source, 'g' + (_regEx.ignoreCase ? 'i' : '')); }

	// IE (and any other browser that can't capture the delimiter)
	// will, unfortunately, have to be slowed down
	var start = 0, arr=[];
	var result;
	while((result = _regEx.exec(this)) != null){
		arr.push(this.slice(start, result.index));
		if(result.length > 1) arr.push(result[1]);
		start = _regEx.lastIndex;
	}
	if(start < this.length) arr.push(this.slice(start));
	if(start == this.length) arr.push(''); //delim at the end
	return arr;
};

ztrans_isArray = function(obj) {
   if (obj.constructor.toString().indexOf('Array') == -1)
	  return false;
   else
	  return true;
}

function ce(tagName, props, pNode, isFirst)
{
  var el= document.createElement(tagName);
  if (props)
  {
	for (prop in props)
	{
	  //try
	  {
		el[prop]=props[prop];
	  }
	  //catch(err)
	  {
		//Handle errors here
	  }
	}
  }
  if (pNode)
  {
	if (isFirst && pNode.firstChild)
	{
	  pNode.insertBefore(el, pNode.firstChild);
	}
	else
	{
	  pNode.appendChild(el);
	}
  }
  return el;
}
function c(v){  console.log(v) ; }
function ge(id) {return document.getElementById(id); }

var zTranslate=function()
{
	
	
	

	
	
	function tagEdit()
	{
		// Get fields
		var isAjaxForm=!!ge('tag-name');
		if (isAjaxForm)
		{
			var prefix='tag-';
			var formId='addtag';
		}
		else
		{
			var prefix='';
			var formId='edittag';
		}
		var nameField=ge(prefix+'name');
		nameField.name='';
		var form=ge(formId);
		// Load text
		var name = zTranslateConfig.term_name[nameField.value] || {};
		onTabSwitch=function ()
		{
			nameField.value=name[this.lang] || '';
		}
		
		
		// Swap fields
		
		
		
		
		
		var newNameField=ce('input', {name: prefix+'name', className: 'hidden', value: nameField.value}, form, true);
		
		var newNameFields={};
		for (var i=0; i<langs.length; i++)
		{
			var lang=langs[i];
			newNameFields[lang]=ce('input', {name: 'ztrans_term_'+lang, className: 'hidden', value: name[lang] || ''}, form, true);
		}
		// Add listeners for fields change
		nameField.onblur=function()
		{
			var activeLanguage=languageSwitch.getActiveLanguage();
			newNameFields[activeLanguage].value=this.value; 
			name[activeLanguage]=this.value;
			if (activeLanguage === zTranslateConfig.default_language)
			{
				newNameField.value=this.value; 
			}
		};
		
	
	}
	
	
	
	function updateFusedValue(target, newValue, store, activeLanguage)
	{
		store[activeLanguage] = newValue;
		target.value = ztrans_integrate(activeLanguage, newValue, target.value);
	}
	
	
	
	function postEdit()
	{
		var form=ge('post');
		var tools=ge('wp-content-editor-tools');
		var contentField=ge('content');
		var	titleField=ge('title'),
				title = ztrans_split(titleField.value),
				content = ztrans_split(contentField.value);
				
			
		var newTitleField=ce('textarea', {name: 'post_title', className: 'hidden', value: titleField.value}, form, true);
		var newContentField=ce('textarea', {name: 'content', className: 'hidden', value: contentField.value}, form, true);
		
		titleField.name='post_title_old';
		contentField.name='content_old';
		titleField.value='';
		contentField.value='';
		
		// Slug
		var realUrl;
		function setSlugLanguage()
		{
			var language=languageSwitch.getActiveLanguage();
			
			var slugPreview1=ge('view-post-btn');
			if (slugPreview1 && slugPreview1.children.length)
			{
				
				var url=slugPreview1.children[0];
				if (!url.urlWasGet)
				{
					realUrl=ce('a', {href: url.href});
					url.urlWasGet=true;
				}
				var localizedUrl=ce('a', {href: realUrl.href});
				switch (zTranslateConfig.url_mode.toString())
				{
					case '1':
						var basePath=localizedUrl.host;
						if (localizedUrl.search)
						{
							localizedUrl.search+="&lang="+language;
						}
						else
						{
							localizedUrl.search="?lang="+language;
						}
						
					break;
					case '2':
						
						var basePath=localizedUrl.host+'/'+language;
						localizedUrl.pathname='/'+language+localizedUrl.pathname;
					break;
					case '3':
						var basePath=language+'.'+localizedUrl.host;
						localizedUrl.host=basePath;
					break;
				}
				basePath=localizedUrl.protocol+'//'+basePath+'/';
				var slugEl=ge('sample-permalink');
				var postName=ge('editable-post-name');
				if (slugEl && slugEl.childNodes.length)
				{
					if (postName)
					{
						slugEl.childNodes[0].nodeValue=basePath;
					}
					else
					{
						slugEl.childNodes[0].nodeValue=localizedUrl.href;
					}
				}
				
				
				if (slugPreview1 && slugPreview1.children.length)
				{
					slugPreview1.children[0].href=localizedUrl.href;
				}
				
				var slugPreview2=ge('preview-action');
				if (slugPreview2 && slugPreview2.children.length)
				{
					slugPreview2.children[0].href=localizedUrl.href;
				}
				
				
			}
		}
		
		ge('edit-slug-box').addEventListener('DOMSubtreeModified', setSlugLanguage);
		
		onTabSwitch=function()
		{
			titleField.value=title[this.lang];
			contentField.value=content[this.lang];
			if (window.tinyMCE && tinyMCE.activeEditor)
			{
				tinyMCE.activeEditor.setContent(content[this.lang]);
			}
			setSlugLanguage();
		}
		
		// Slug onedit
		
		
		var fullscreenHooksWereSet=false;
		function setFullscreenEditorHooks()
		{
			if (!fullscreenHooksWereSet)
			{
				
				var fullscreenEditor=tinyMCE.get("wp_mce_fullscreen");
				if (fullscreenEditor)
				{
					fullscreenHooksWereSet=true;
					fullscreenEditor.getBody().onblur=function(){updateFusedValue(newContentField, fullscreenEditor.getContent(), content, fullscreenLanguageSwitch.getActiveLanguage()); };
				}
			}
		}
		
		var fullscreenEnterEvent=false;
		function onFullscreenEnter(ed, command)
		{
			
			if (command==='wpFullScreen')
			{
				if (!fullscreenEnterEvent)
				{
					fullscreenEnterEvent=true;
					var fullscreenTitleField=ge('wp-fullscreen-title');
					var fullscreenContentField=ge('wp_mce_fullscreen');
					
					onFullscreenTabSwitch=function()
					{
						
						fullscreenTitleField.value=title[this.lang];
						fullscreenContentField.value=content[this.lang];
						if (window.tinyMCE)
						{
							var fullscreenEditor=tinyMCE.get("wp_mce_fullscreen");
							if (fullscreenEditor)
							{
								fullscreenEditor.setContent(content[this.lang]);
							}
						}
					}
					fullscreenTitleField.onblur=function(){ updateFusedValue(newTitleField, this.value, title, fullscreenLanguageSwitch.getActiveLanguage()); };
					fullscreenContentField.onblur=function(){ updateFusedValue(newContentField, this.value, content, fullscreenLanguageSwitch.getActiveLanguage()); };
					if (window.tinyMCE)
					{
						setFullscreenEditorHooks();
					}
					var editorBody=ge('wp-fullscreen-wrap');
					var langSwitchWrap=ce('ul', {className: 'ztranslate-lang-switch-wrap'},editorBody, true);
					fullscreenLanguageSwitch=new LanguageSwitch(langSwitchWrap);
					fullscreenLanguageSwitch.onSwitch(onTabSwitch);
					fullscreenLanguageSwitch.onSwitch(onFullscreenTabSwitch);
					
					ge('wp-fullscreen-close').addEventListener('click', function()
						{
							languageSwitch.switchLanguage(fullscreenLanguageSwitch.getActiveLanguage());
						}
					);
				}
				fullscreenLanguageSwitch.switchLanguage(languageSwitch.getActiveLanguage());
			}
		}


		var hooksWereSet=false;
		
		function setEditorHooks()
		{
			
			if (!hooksWereSet)
			{
				hooksWereSet=true;
				tinyMCE.activeEditor.getBody().addEventListener('blur',function(){updateFusedValue(newContentField, tinyMCE.activeEditor.getContent(), content, languageSwitch.getActiveLanguage()); } )
				tinyMCE.activeEditor.onExecCommand.add(onFullscreenEnter);
			}
		}
		
		
		// Add listeners for fields change
		titleField.onblur=function(){ updateFusedValue(newTitleField, this.value, title, languageSwitch.getActiveLanguage()); };
		contentField.onblur=function(){ updateFusedValue(newContentField, this.value, content, languageSwitch.getActiveLanguage()); };
		window.addEventListener('load', function()
		{
			var qtFullscreenButton=ge('qt_content_fullscreen');
			qtFullscreenButton.addEventListener('click', function() {onFullscreenEnter(null, 'wpFullScreen'); } );
			if (window.tinyMCE && tinyMCE.activeEditor)
			{
				
				tinyMCE.activeEditor.setContent('');
				setEditorHooks();
			}
			
			tinyMCEPreInit.mceInit.content.setup=function(ed)
			{
				ed.onInit.add(function(ed)
				{
					setEditorHooks();
					setFullscreenEditorHooks();
				});
				
			}
			languageSwitch.switchLanguage(languageSwitch.getActiveLanguage());
			
		});
		
	
	}
	var needToLoad=false;
	var langs,
				langNames;
	var needToLoad=false;
	var matches = location.pathname.match(/(\/wp-admin\/([^\/]*))$/);
	switch (matches && matches[1])
	{
		case "/wp-admin/post.php":
		case "/wp-admin/post-new.php":
			var langs=zTranslateConfig.enabled_languages,
					langNames=zTranslateConfig.language_name;
			postEdit();
			needToLoad=true;
		break;
		case "/wp-admin/edit-tags.php":
			var langs=zTranslateConfig.enabled_languages,
					langNames=zTranslateConfig.language_name;
			tagEdit();
			needToLoad=true;
		break;
	}
	if (needToLoad)
	{
		var header=document.getElementsByClassName('wrap')[0].getElementsByTagName('h2')[0];
		var langSwitchWrap=ce('ul', {className: 'ztranslate-lang-switch-wrap'});
		header.parentNode.insertBefore(langSwitchWrap, header.nextElementSibling);
		languageSwitch=new LanguageSwitch(langSwitchWrap);
		languageSwitch.onSwitch(onTabSwitch);
		languageSwitch.switchLanguage();
	}
}
function LanguageSwitch(target)
{
	var langs=zTranslateConfig.enabled_languages,
			langNames=zTranslateConfig.language_name,
			previousLanguage=false,
			activeLanguage=false;
	var tabSwitches={};
	function switchTab()
	{
		var tabSwitch=this;
		previousLanguage=activeLanguage;
		activeLanguage=tabSwitch.lang;
		if (previousLanguage)
		{
			tabSwitches[previousLanguage].classList.remove('active');
		}
		tabSwitch.classList.add('active');
		
		
		for (var i=0; i<onTabSwitch.length; i++)
		{
			onTabSwitch[i].call(this);
		}


	}
	var onTabSwitch=[];
	
	for (var i=0; i<langs.length; i++)
	{
		var lang=langs[i];
		var tabSwitch=ce ('li', {lang: lang, className: 'ztranslate-lang-switch', onclick: switchTab }, target );
		ce('img', {src: '/wp-content/'+zTranslateConfig.flag_location+zTranslateConfig.flag[lang]}, tabSwitch);
		ce('span', {innerHTML: langNames[lang]}, tabSwitch);
		tabSwitches[lang]=tabSwitch;
	}
	this.getActiveLanguage=function()
	{
		return activeLanguage;
	}
	this.onSwitch=function(callback)
	{
		if (typeof callback==='function')
		{
			onTabSwitch.push(callback);
		}
	}
	this.switchLanguage=function(langName)
	{
		if (langName)
		{
			tabSwitches[langName].click();
		}
		else
		{
			tabSwitch.click();
		}
	}
}

new zTranslate;


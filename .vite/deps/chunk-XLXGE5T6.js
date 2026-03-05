// node_modules/.pnpm/@vue+shared@3.6.0-beta.7/node_modules/@vue/shared/dist/shared.esm-bundler.js
function makeMap(str) {
  const map2 = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map2[key] = 1;
  return (val) => val in map2;
}
var EMPTY_OBJ = true ? Object.freeze({}) : {};
var EMPTY_ARR = true ? Object.freeze([]) : [];
var NOOP = () => {
};
var NO = () => false;
var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
var isModelListener = (key) => key.startsWith("onUpdate:");
var extend = Object.assign;
var remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) arr.splice(i, 1);
};
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isSet = (val) => toTypeString(val) === "[object Set]";
var isDate = (val) => toTypeString(val) === "[object Date]";
var isRegExp = (val) => toTypeString(val) === "[object RegExp]";
var isFunction = (val) => typeof val === "function";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isPlainObject = (val) => toTypeString(val) === "[object Object]";
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var isReservedProp = makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
var isBuiltInTag = makeMap("slot,component");
var isBuiltInDirective = makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
var cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    return cache[str] || (cache[str] = fn(str));
  });
};
var camelizeRE = /-(\w)/g;
var camelizeReplacer = (_, c) => c ? c.toUpperCase() : "";
var camelize = cacheStringFunction((str) => str.replace(camelizeRE, camelizeReplacer));
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
var toHandlerKey = cacheStringFunction((str) => {
  return str ? `on${capitalize(str)}` : ``;
});
var getModifierPropName = (name) => {
  return `${name === "modelValue" || name === "model-value" ? "model" : name}Modifiers${name === "model" ? "$" : ""}`;
};
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) fns[i](...arg);
};
var def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
var looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
var toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
var _globalThis;
var getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function canSetValueDirectly(tagName) {
  return tagName !== "PROGRESS" && !tagName.includes("-");
}
var GLOBALS_ALLOWED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol";
var isGloballyAllowed = makeMap(GLOBALS_ALLOWED);
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) for (const key in normalized) res[key] = normalized[key];
    }
    return res;
  } else if (isString(value) || isObject(value)) return value;
}
var listDelimiterRE = /;(?![^(]*\))/g;
var propertyDelimiterRE = /:([^]+)/;
var styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function stringifyStyle(styles) {
  if (!styles) return "";
  if (isString(styles)) return styles;
  let ret = "";
  for (const key in styles) {
    const value = styles[key];
    if (isString(value) || typeof value === "number") {
      const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) res = value;
  else if (isArray(value)) for (let i = 0; i < value.length; i++) {
    const normalized = normalizeClass(value[i]);
    if (normalized) res += normalized + " ";
  }
  else if (isObject(value)) {
    for (const name in value) if (value[name]) res += name + " ";
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props) return null;
  let { class: klass, style } = props;
  if (klass && !isString(klass)) props.class = normalizeClass(klass);
  if (style) props.style = normalizeStyle(style);
  return props;
}
var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
var MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
var VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
var FORMATTING_TAGS = "a,b,big,code,em,font,i,nobr,s,small,strike,strong,tt,u";
var ALWAYS_CLOSE_TAGS = "title,style,script,noscript,template,object,table,button,textarea,select,iframe,fieldset";
var INLINE_TAGS = "a,abbr,acronym,b,bdi,bdo,big,br,button,canvas,cite,code,data,datalist,del,dfn,em,embed,i,iframe,img,input,ins,kbd,label,map,mark,meter,noscript,object,output,picture,progress,q,ruby,s,samp,script,select,small,span,strong,sub,sup,svg,textarea,time,u,tt,var,video";
var BLOCK_TAGS = "address,article,aside,blockquote,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,li,main,menu,nav,ol,p,pre,section,table,ul";
var isHTMLTag = makeMap(HTML_TAGS);
var isSVGTag = makeMap(SVG_TAGS);
var isMathMLTag = makeMap(MATH_TAGS);
var isVoidTag = makeMap(VOID_TAGS);
var isFormattingTag = makeMap(FORMATTING_TAGS);
var isAlwaysCloseTag = makeMap(ALWAYS_CLOSE_TAGS);
var isInlineTag = makeMap(INLINE_TAGS);
var isBlockTag = makeMap(BLOCK_TAGS);
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isSpecialBooleanAttr = makeMap(specialBooleanAttrs);
var isBooleanAttr = makeMap(specialBooleanAttrs + ",async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected");
function includeBooleanAttr(value) {
  return !!value || value === "";
}
var isKnownHtmlAttr = makeMap("accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,inert,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap");
var isKnownSvgAttr = makeMap("xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xmlns:xlink,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan");
var isKnownMathMLAttr = makeMap("accent,accentunder,actiontype,align,alignmentscope,altimg,altimg-height,altimg-valign,altimg-width,alttext,bevelled,close,columnsalign,columnlines,columnspan,denomalign,depth,dir,display,displaystyle,encoding,equalcolumns,equalrows,fence,fontstyle,fontweight,form,frame,framespacing,groupalign,height,href,id,indentalign,indentalignfirst,indentalignlast,indentshift,indentshiftfirst,indentshiftlast,indextype,justify,largetop,largeop,lquote,lspace,mathbackground,mathcolor,mathsize,mathvariant,maxsize,minlabelspacing,mode,other,overflow,position,rowalign,rowlines,rowspan,rquote,rspace,scriptlevel,scriptminsize,scriptsizemultiplier,selection,separator,separators,shift,side,src,stackalign,stretchy,subscriptshift,superscriptshift,symmetric,voffset,width,widths,xlink:href,xlink:show,xlink:type,xmlns");
function isRenderableAttrValue(value) {
  if (value == null) return false;
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean";
}
function shouldSetAsAttr(tagName, key) {
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return true;
  if (key === "form") return true;
  if (key === "list" && tagName === "INPUT") return true;
  if (key === "type" && tagName === "TEXTAREA") return true;
  if ((key === "width" || key === "height") && (tagName === "IMG" || tagName === "VIDEO" || tagName === "CANVAS" || tagName === "SOURCE")) return true;
  if (key === "sandbox" && tagName === "IFRAME") return true;
  return false;
}
var cssVarNameEscapeSymbolsRE = /[ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;
function getEscapedCssVarName(key, doubleEscape) {
  return key.replace(cssVarNameEscapeSymbolsRE, (s) => doubleEscape ? s === '"' ? '\\\\\\"' : `\\\\${s}` : `\\${s}`);
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i]);
  return equal;
}
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) return a === b;
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) return false;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
var isRef = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
var toDisplayString = (val) => {
  switch (typeof val) {
    case "string":
      return val;
    case "object":
      if (val) {
        if (isRef(val)) return toDisplayString(val.value);
        else if (isArray(val) || val.toString === objectToString || !isFunction(val.toString)) return JSON.stringify(val, replacer, 2);
      }
    default:
      return val == null ? "" : String(val);
  }
};
var replacer = (_key, val) => {
  if (isRef(val)) return replacer(_key, val.value);
  else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
    entries[stringifySymbol(key, i) + " =>"] = val2;
    return entries;
  }, {}) };
  else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
  else if (isSymbol(val)) return stringifySymbol(val);
  else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
  return val;
};
var stringifySymbol = (v, i = "") => {
  var _description;
  return isSymbol(v) ? `Symbol(${(_description = v.description) !== null && _description !== void 0 ? _description : i})` : v;
};
function getSequence(arr) {
  const p3 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p3[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) u = c + 1;
        else v = c;
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) p3[i] = result[u - 1];
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p3[v];
  }
  return result;
}
function normalizeCssVarValue(value) {
  if (value == null) return "initial";
  if (typeof value === "string") return value === "" ? " " : value;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    if (true) console.warn("[Vue warn] Invalid value used for CSS binding. Expected a string or a finite number but received:", value);
  }
  return String(value);
}

// node_modules/.pnpm/@vue+reactivity@3.6.0-beta.7/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
var triggerEventInfos = [];
function onTrack(sub, debugInfo) {
  if (false) throw new Error(`Internal error: onTrack should be called only in development.`);
  if (sub.onTrack) sub.onTrack(extend({ effect: sub }, debugInfo));
}
function onTrigger(sub) {
  if (false) throw new Error(`Internal error: onTrigger should be called only in development.`);
  if (sub.onTrigger) {
    const debugInfo = triggerEventInfos[triggerEventInfos.length - 1];
    sub.onTrigger(extend({ effect: sub }, debugInfo));
  }
}
function setupOnTrigger(target) {
  if (false) throw new Error(`Internal error: setupOnTrigger should be called only in development.`);
  Object.defineProperty(target.prototype, "onTrigger", {
    get() {
      return this._onTrigger;
    },
    set(val) {
      if (val && !this._onTrigger) setupFlagsHandler(this);
      this._onTrigger = val;
    }
  });
}
function setupFlagsHandler(target) {
  target._flags = target.flags;
  Object.defineProperty(target, "flags", {
    get() {
      return target._flags;
    },
    set(value) {
      if (!(target._flags & 48) && !!(value & 48)) onTrigger(this);
      target._flags = value;
    }
  });
}
function warn(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
var ReactiveFlags$1 = {
  "None": 0,
  "0": "None",
  "Mutable": 1,
  "1": "Mutable",
  "Watching": 2,
  "2": "Watching",
  "RecursedCheck": 4,
  "4": "RecursedCheck",
  "Recursed": 8,
  "8": "Recursed",
  "Dirty": 16,
  "16": "Dirty",
  "Pending": 32,
  "32": "Pending"
};
var notifyBuffer = [];
var batchDepth = 0;
var activeSub = void 0;
var globalVersion = 0;
var notifyIndex = 0;
var notifyBufferLength = 0;
function setActiveSub(sub) {
  try {
    return activeSub;
  } finally {
    activeSub = sub;
  }
}
function startBatch() {
  ++batchDepth;
}
function endBatch() {
  if (!--batchDepth && notifyBufferLength) flush();
}
function link(dep, sub) {
  const prevDep = sub.depsTail;
  if (prevDep !== void 0 && prevDep.dep === dep) return;
  const nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
  if (nextDep !== void 0 && nextDep.dep === dep) {
    nextDep.version = globalVersion;
    sub.depsTail = nextDep;
    return;
  }
  const prevSub = dep.subsTail;
  if (prevSub !== void 0 && prevSub.version === globalVersion && prevSub.sub === sub) return;
  const newLink = sub.depsTail = dep.subsTail = {
    version: globalVersion,
    dep,
    sub,
    prevDep,
    nextDep,
    prevSub,
    nextSub: void 0
  };
  if (nextDep !== void 0) nextDep.prevDep = newLink;
  if (prevDep !== void 0) prevDep.nextDep = newLink;
  else sub.deps = newLink;
  if (prevSub !== void 0) prevSub.nextSub = newLink;
  else dep.subs = newLink;
}
function unlink(link2, sub = link2.sub) {
  const dep = link2.dep;
  const prevDep = link2.prevDep;
  const nextDep = link2.nextDep;
  const nextSub = link2.nextSub;
  const prevSub = link2.prevSub;
  if (nextDep !== void 0) nextDep.prevDep = prevDep;
  else sub.depsTail = prevDep;
  if (prevDep !== void 0) prevDep.nextDep = nextDep;
  else sub.deps = nextDep;
  if (nextSub !== void 0) nextSub.prevSub = prevSub;
  else dep.subsTail = prevSub;
  if (prevSub !== void 0) prevSub.nextSub = nextSub;
  else if ((dep.subs = nextSub) === void 0) {
    let toRemove = dep.deps;
    if (toRemove !== void 0) {
      do
        toRemove = unlink(toRemove, dep);
      while (toRemove !== void 0);
      dep.flags |= 16;
    }
  }
  return nextDep;
}
function propagate(link2) {
  let next2 = link2.nextSub;
  let stack2;
  top: do {
    const sub = link2.sub;
    let flags = sub.flags;
    if (flags & 3) {
      if (!(flags & 60)) sub.flags = flags | 32;
      else if (!(flags & 12)) flags = 0;
      else if (!(flags & 4)) sub.flags = flags & -9 | 32;
      else if (!(flags & 48) && isValidLink(link2, sub)) {
        sub.flags = flags | 40;
        flags &= 1;
      } else flags = 0;
      if (flags & 2) notifyBuffer[notifyBufferLength++] = sub;
      if (flags & 1) {
        const subSubs = sub.subs;
        if (subSubs !== void 0) {
          link2 = subSubs;
          if (subSubs.nextSub !== void 0) {
            stack2 = {
              value: next2,
              prev: stack2
            };
            next2 = link2.nextSub;
          }
          continue;
        }
      }
    }
    if ((link2 = next2) !== void 0) {
      next2 = link2.nextSub;
      continue;
    }
    while (stack2 !== void 0) {
      link2 = stack2.value;
      stack2 = stack2.prev;
      if (link2 !== void 0) {
        next2 = link2.nextSub;
        continue top;
      }
    }
    break;
  } while (true);
}
function startTracking(sub) {
  ++globalVersion;
  sub.depsTail = void 0;
  sub.flags = sub.flags & -57 | 4;
  return setActiveSub(sub);
}
function endTracking(sub, prevSub) {
  if (activeSub !== sub) warn("Active effect was not restored correctly - this is likely a Vue internal bug.");
  activeSub = prevSub;
  const depsTail = sub.depsTail;
  let toRemove = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
  while (toRemove !== void 0) toRemove = unlink(toRemove, sub);
  sub.flags &= -5;
}
function flush() {
  while (notifyIndex < notifyBufferLength) {
    const effect2 = notifyBuffer[notifyIndex];
    notifyBuffer[notifyIndex++] = void 0;
    effect2.notify();
  }
  notifyIndex = 0;
  notifyBufferLength = 0;
}
function checkDirty(link2, sub) {
  let stack2;
  let checkDepth = 0;
  top: do {
    const dep = link2.dep;
    const depFlags = dep.flags;
    let dirty = false;
    if (sub.flags & 16) dirty = true;
    else if ((depFlags & 17) === 17) {
      if (dep.update()) {
        const subs = dep.subs;
        if (subs.nextSub !== void 0) shallowPropagate(subs);
        dirty = true;
      }
    } else if ((depFlags & 33) === 33) {
      if (link2.nextSub !== void 0 || link2.prevSub !== void 0) stack2 = {
        value: link2,
        prev: stack2
      };
      link2 = dep.deps;
      sub = dep;
      ++checkDepth;
      continue;
    }
    if (!dirty && link2.nextDep !== void 0) {
      link2 = link2.nextDep;
      continue;
    }
    while (checkDepth) {
      --checkDepth;
      const firstSub = sub.subs;
      const hasMultipleSubs = firstSub.nextSub !== void 0;
      if (hasMultipleSubs) {
        link2 = stack2.value;
        stack2 = stack2.prev;
      } else link2 = firstSub;
      if (dirty) {
        if (sub.update()) {
          if (hasMultipleSubs) shallowPropagate(firstSub);
          sub = link2.sub;
          continue;
        }
      } else sub.flags &= -33;
      sub = link2.sub;
      if (link2.nextDep !== void 0) {
        link2 = link2.nextDep;
        continue top;
      }
      dirty = false;
    }
    return dirty;
  } while (true);
}
function shallowPropagate(link2) {
  do {
    const sub = link2.sub;
    const nextSub = link2.nextSub;
    const subFlags = sub.flags;
    if ((subFlags & 48) === 32) sub.flags = subFlags | 16;
    link2 = nextSub;
  } while (link2 !== void 0);
}
function isValidLink(checkLink, sub) {
  let link2 = sub.depsTail;
  while (link2 !== void 0) {
    if (link2 === checkLink) return true;
    link2 = link2.prevDep;
  }
  return false;
}
var Dep = class {
  constructor(map2, key) {
    this.map = map2;
    this.key = key;
    this._subs = void 0;
    this.subsTail = void 0;
    this.flags = 0;
  }
  get subs() {
    return this._subs;
  }
  set subs(value) {
    this._subs = value;
    if (value === void 0) this.map.delete(this.key);
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = /* @__PURE__ */ Symbol(true ? "Object iterate" : "");
var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(true ? "Map keys iterate" : "");
var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(true ? "Array iterate" : "");
function track(target, type, key) {
  if (activeSub !== void 0) {
    let depsMap = targetMap.get(target);
    if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    let dep = depsMap.get(key);
    if (!dep) depsMap.set(key, dep = new Dep(depsMap, key));
    if (true) onTrack(activeSub, {
      target,
      type,
      key
    });
    link(dep, activeSub);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const run = (dep) => {
    if (dep !== void 0 && dep.subs !== void 0) {
      if (true) triggerEventInfos.push({
        target,
        type,
        key,
        newValue,
        oldValue,
        oldTarget
      });
      propagate(dep.subs);
      shallowPropagate(dep.subs);
      if (true) triggerEventInfos.pop();
    }
  };
  startBatch();
  if (type === "clear") depsMap.forEach(run);
  else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
      if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
          } else if (isArrayIndex) run(depsMap.get("length"));
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
          break;
        case "set":
          if (isMap(target)) run(depsMap.get(ITERATE_KEY));
          break;
      }
    }
  }
  endBatch();
}
function getDepFromReactive(object, key) {
  const depMap = targetMap.get(object);
  return depMap && depMap.get(key);
}
function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (isReadonly(target)) return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  return toReactive(item);
}
var arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
  },
  find(fn, thisArg) {
    return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) result.value = wrapValue(result.value);
      return result;
    };
  }
  return iter;
}
var arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) wrappedFn = function(item, index) {
      return fn.call(this, toWrapped(self2, item), index, self2);
    };
    else if (fn.length > 2) wrappedFn = function(item, index) {
      return fn.call(this, item, index, self2);
    };
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  let wrappedFn = fn;
  if (arr !== self2) {
    if (!isShallow(self2)) wrappedFn = function(acc, item, index) {
      return fn.call(this, acc, toWrapped(self2, item), index, self2);
    };
    else if (fn.length > 3) wrappedFn = function(acc, item, index) {
      return fn.call(this, acc, item, index, self2);
    };
  }
  return arr[method](wrappedFn, ...args);
}
function searchProxy(self2, method, args) {
  const arr = toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  startBatch();
  const prevSub = setActiveSub();
  const res = toRaw(self2)[method].apply(self2, args);
  setActiveSub(prevSub);
  endBatch();
  return res;
}
var isNonTrackableKeys = makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
function hasOwnProperty2(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") return !isReadonly2;
    else if (key === "__v_isReadonly") return isReadonly2;
    else if (key === "__v_isShallow") return isShallow2;
    else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
      if (key === "hasOwnProperty") return hasOwnProperty2;
    }
    const wasRef = isRef2(target);
    const res = Reflect.get(target, key, wasRef ? target : receiver);
    if (wasRef && key !== "value") return res;
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
    if (!isReadonly2) track(target, "get", key);
    if (isShallow2) return res;
    if (isRef2(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? readonly(value) : value;
    }
    if (isObject(res)) return isReadonly2 ? readonly(res) : reactive(res);
    return res;
  }
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArrayWithIntegerKey && isRef2(oldValue) && !isRef2(value)) if (isOldValueReadonly) {
        if (true) warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target[key]);
        return true;
      } else {
        oldValue.value = value;
        return true;
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, isRef2(target) ? target : receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) trigger(target, "add", key, value);
      else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
    return result;
  }
  ownKeys(target) {
    track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    if (true) warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
    return true;
  }
  deleteProperty(target, key) {
    if (true) warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
    return true;
  }
};
var mutableHandlers = new MutableReactiveHandler();
var readonlyHandlers = new ReadonlyReactiveHandler();
var shallowReactiveHandlers = new MutableReactiveHandler(true);
var shallowReadonlyHandlers = new ReadonlyReactiveHandler(true);
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return extend(Object.create(innerIterator), { next() {
      const { value, done } = innerIterator.next();
      return done ? {
        value,
        done
      } : {
        value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
        done
      };
    } });
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    if (true) {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) return wrap(target.get(key));
      else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
      else if (target !== rawTarget) target.get(key);
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(instrumentations, readonly2 ? {
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear")
  } : {
    add(value) {
      if (!shallow && !isShallow(value) && !isReadonly(value)) value = toRaw(value);
      const target = toRaw(this);
      if (!getProto(target).has.call(target, value)) {
        target.add(value);
        trigger(target, "add", value, value);
      }
      return this;
    },
    set(key, value) {
      if (!shallow && !isShallow(value) && !isReadonly(value)) value = toRaw(value);
      const target = toRaw(this);
      const { has, get } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
      } else if (true) checkIdentityKeys(target, has, key);
      const oldValue = get.call(target, key);
      target.set(key, value);
      if (!hadKey) trigger(target, "add", key, value);
      else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
      return this;
    },
    delete(key) {
      const target = toRaw(this);
      const { has, get } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
      } else if (true) checkIdentityKeys(target, has, key);
      const oldValue = get ? get.call(target, key) : void 0;
      const result = target.delete(key);
      if (hadKey) trigger(target, "delete", key, void 0, oldValue);
      return result;
    },
    clear() {
      const target = toRaw(this);
      const hadItems = target.size !== 0;
      const oldTarget = true ? isMap(target) ? new Map(target) : new Set(target) : void 0;
      const result = target.clear();
      if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
      return result;
    }
  });
  [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") return !isReadonly2;
    else if (key === "__v_isReadonly") return isReadonly2;
    else if (key === "__v_raw") return target;
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
var mutableCollectionHandlers = { get: createInstrumentationGetter(false, false) };
var shallowCollectionHandlers = { get: createInstrumentationGetter(false, true) };
var readonlyCollectionHandlers = { get: createInstrumentationGetter(true, false) };
var shallowReadonlyCollectionHandlers = { get: createInstrumentationGetter(true, true) };
function checkIdentityKeys(target, has, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has.call(target, rawKey)) {
    const type = toRawType(target);
    warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
  }
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) return target;
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    if (true) warn(`value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(target)}`);
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
  const targetType = getTargetType(target);
  if (targetType === 0) return target;
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) return isReactive(value["__v_raw"]);
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
  return value;
}
var toReactive = (value) => isObject(value) ? reactive(value) : value;
var toReadonly = (value) => isObject(value) ? readonly(value) : value;
function isRef2(r) {
  return r ? r["__v_isRef"] === true : false;
}
function ref(value) {
  return createRef(value, toReactive);
}
function shallowRef(value) {
  return createRef(value);
}
function createRef(rawValue, wrap) {
  if (isRef2(rawValue)) return rawValue;
  return new RefImpl(rawValue, wrap);
}
var RefImpl = class {
  constructor(value, wrap) {
    this.subs = void 0;
    this.subsTail = void 0;
    this.flags = ReactiveFlags$1.Mutable;
    this.__v_isRef = true;
    this.__v_isShallow = false;
    this._oldValue = this._rawValue = wrap ? toRaw(value) : value;
    this._value = wrap ? wrap(value) : value;
    this._wrap = wrap;
    this["__v_isShallow"] = !wrap;
  }
  get dep() {
    return this;
  }
  get value() {
    trackRef(this);
    if (this.flags & ReactiveFlags$1.Dirty && this.update()) {
      const subs = this.subs;
      if (subs !== void 0) shallowPropagate(subs);
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
    newValue = useDirectValue ? newValue : toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this.flags |= ReactiveFlags$1.Dirty;
      this._rawValue = newValue;
      this._value = !useDirectValue && this._wrap ? this._wrap(newValue) : newValue;
      const subs = this.subs;
      if (subs !== void 0) {
        if (true) triggerEventInfos.push({
          target: this,
          type: "set",
          key: "value",
          newValue,
          oldValue
        });
        propagate(subs);
        if (!batchDepth) flush();
        if (true) triggerEventInfos.pop();
      }
    }
  }
  update() {
    this.flags &= ~ReactiveFlags$1.Dirty;
    return hasChanged(this._oldValue, this._oldValue = this._rawValue);
  }
};
function triggerRef(ref2) {
  const dep = ref2.dep;
  if (dep !== void 0 && dep.subs !== void 0) {
    propagate(dep.subs);
    shallowPropagate(dep.subs);
    if (!batchDepth) flush();
  }
}
function trackRef(dep) {
  if (activeSub !== void 0) {
    if (true) onTrack(activeSub, {
      target: dep,
      type: "get",
      key: "value"
    });
    link(dep, activeSub);
  }
}
function unref(ref2) {
  return isRef2(ref2) ? ref2.value : ref2;
}
function toValue(source) {
  return isFunction(source) ? source() : unref(source);
}
var shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef2(oldValue) && !isRef2(value)) {
      oldValue.value = value;
      return true;
    } else return Reflect.set(target, key, value, receiver);
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
var CustomRefImpl = class {
  constructor(factory) {
    this.subs = void 0;
    this.subsTail = void 0;
    this.flags = ReactiveFlags$1.None;
    this["__v_isRef"] = true;
    this._value = void 0;
    const { get, set } = factory(() => trackRef(this), () => triggerRef(this));
    this._get = get;
    this._set = set;
  }
  get dep() {
    return this;
  }
  get value() {
    return this._value = this._get();
  }
  set value(newVal) {
    this._set(newVal);
  }
};
function customRef(factory) {
  return new CustomRefImpl(factory);
}
function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {};
  for (const key in object) ret[key] = propertyToRef(object, key);
  return ret;
}
var ObjectRefImpl = class {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this["__v_isRef"] = true;
    this._value = void 0;
    this._raw = toRaw(_object);
    let shallow = true;
    let obj = _object;
    if (!isArray(_object) || !isIntegerKey(String(_key))) do
      shallow = !isProxy(obj) || isShallow(obj);
    while (shallow && (obj = obj["__v_raw"]));
    this._shallow = shallow;
  }
  get value() {
    let val = this._object[this._key];
    if (this._shallow) val = unref(val);
    return this._value = val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    if (this._shallow && isRef2(this._raw[this._key])) {
      const nestedRef = this._object[this._key];
      if (isRef2(nestedRef)) {
        nestedRef.value = newVal;
        return;
      }
    }
    this._object[this._key] = newVal;
  }
  get dep() {
    return getDepFromReactive(this._raw, this._key);
  }
};
var GetterRefImpl = class {
  constructor(_getter) {
    this._getter = _getter;
    this["__v_isRef"] = true;
    this["__v_isReadonly"] = true;
    this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
};
function toRef(source, key, defaultValue) {
  if (isRef2(source)) return source;
  else if (isFunction(source)) return new GetterRefImpl(source);
  else if (isObject(source) && arguments.length > 1) return propertyToRef(source, key, defaultValue);
  else return ref(source);
}
function propertyToRef(source, key, defaultValue) {
  return new ObjectRefImpl(source, key, defaultValue);
}
var ReactiveEffect = class {
  fn() {
  }
  constructor(fn) {
    this.deps = void 0;
    this.depsTail = void 0;
    this.subs = void 0;
    this.subsTail = void 0;
    this.flags = 18;
    this.cleanups = [];
    this.cleanupsLength = 0;
    if (fn !== void 0) this.fn = fn;
    if (activeEffectScope) link(this, activeEffectScope);
  }
  get active() {
    return !(this.flags & 1024);
  }
  pause() {
    this.flags |= 256;
  }
  resume() {
    if ((this.flags &= -257) & 48) this.notify();
  }
  notify() {
    if (!(this.flags & 256) && this.dirty) this.run();
  }
  run() {
    if (!this.active) return this.fn();
    cleanup(this);
    const prevSub = startTracking(this);
    try {
      return this.fn();
    } finally {
      endTracking(this, prevSub);
      const flags = this.flags;
      if ((flags & 136) === 136) {
        this.flags = flags & -9;
        this.notify();
      }
    }
  }
  stop() {
    if (!this.active) return;
    this.flags = 1024;
    let dep = this.deps;
    while (dep !== void 0) dep = unlink(dep, this);
    const sub = this.subs;
    if (sub !== void 0) unlink(sub);
    cleanup(this);
  }
  get dirty() {
    const flags = this.flags;
    if (flags & 16) return true;
    if (flags & 32) if (checkDirty(this.deps, this)) {
      this.flags = flags | 16;
      return true;
    } else this.flags = flags & -33;
    return false;
  }
};
if (true) setupOnTrigger(ReactiveEffect);
function effect(fn, options) {
  if (fn.effect instanceof ReactiveEffect) fn = fn.effect.fn;
  const e = new ReactiveEffect(fn);
  if (options) {
    const { onStop, scheduler } = options;
    if (onStop) {
      options.onStop = void 0;
      const stop2 = e.stop.bind(e);
      e.stop = () => {
        stop2();
        onStop();
      };
    }
    if (scheduler) {
      options.scheduler = void 0;
      e.notify = () => {
        if (!(e.flags & 256)) scheduler();
      };
    }
    extend(e, options);
  }
  try {
    e.run();
  } catch (err) {
    e.stop();
    throw err;
  }
  const runner = e.run.bind(e);
  runner.effect = e;
  return runner;
}
function stop(runner) {
  runner.effect.stop();
}
var resetTrackingStack = [];
function pauseTracking() {
  resetTrackingStack.push(activeSub);
  setActiveSub();
}
function resetTracking() {
  if (resetTrackingStack.length === 0) warn("resetTracking() was called when there was no active tracking to reset.");
  if (resetTrackingStack.length) setActiveSub(resetTrackingStack.pop());
  else setActiveSub();
}
function cleanup(sub) {
  const l = sub.cleanupsLength;
  if (l) {
    for (let i = 0; i < l; i++) sub.cleanups[i]();
    sub.cleanupsLength = 0;
  }
}
function onEffectCleanup(fn, failSilently = false) {
  if (activeSub instanceof ReactiveEffect) activeSub.cleanups[activeSub.cleanupsLength++] = () => cleanupEffect(fn);
  else if (!failSilently) warn("onEffectCleanup() was called when there was no active effect to associate with.");
}
function cleanupEffect(fn) {
  const prevSub = setActiveSub();
  try {
    fn();
  } finally {
    setActiveSub(prevSub);
  }
}
var activeEffectScope;
var EffectScope = class {
  constructor(detached = false) {
    this.deps = void 0;
    this.depsTail = void 0;
    this.subs = void 0;
    this.subsTail = void 0;
    this.flags = 0;
    this.cleanups = [];
    this.cleanupsLength = 0;
    if (!detached && activeEffectScope) link(this, activeEffectScope);
  }
  get active() {
    return !(this.flags & 1024);
  }
  pause() {
    if (!(this.flags & 256)) {
      this.flags |= 256;
      for (let link2 = this.deps; link2 !== void 0; link2 = link2.nextDep) {
        const dep = link2.dep;
        if ("pause" in dep) dep.pause();
      }
    }
  }
  /**
  * Resumes the effect scope, including all child scopes and effects.
  */
  resume() {
    const flags = this.flags;
    if (flags & 256) {
      this.flags = flags & -257;
      for (let link2 = this.deps; link2 !== void 0; link2 = link2.nextDep) {
        const dep = link2.dep;
        if ("resume" in dep) dep.resume();
      }
    }
  }
  run(fn) {
    const prevScope = activeEffectScope;
    try {
      activeEffectScope = this;
      return fn();
    } finally {
      activeEffectScope = prevScope;
    }
  }
  stop() {
    if (!this.active) return;
    this.flags = 1024;
    this.reset();
    const sub = this.subs;
    if (sub !== void 0) unlink(sub);
  }
  /**
  * @internal
  */
  reset() {
    let dep = this.deps;
    while (dep !== void 0) {
      const node = dep.dep;
      if ("stop" in node) {
        dep = dep.nextDep;
        node.stop();
      } else dep = unlink(dep, this);
    }
    cleanup(this);
  }
};
function effectScope(detached) {
  return new EffectScope(detached);
}
function getCurrentScope() {
  return activeEffectScope;
}
function setCurrentScope(scope) {
  try {
    return activeEffectScope;
  } finally {
    activeEffectScope = scope;
  }
}
function onScopeDispose(fn, failSilently = false) {
  if (activeEffectScope !== void 0) activeEffectScope.cleanups[activeEffectScope.cleanupsLength++] = fn;
  else if (!failSilently) warn("onScopeDispose() is called when there is no active effect scope to be associated with.");
}
var ComputedRefImpl = class {
  get effect() {
    return this;
  }
  get dep() {
    return this;
  }
  /**
  * @internal
  * for backwards compat
  */
  get _dirty() {
    const flags = this.flags;
    if (flags & ReactiveFlags$1.Dirty) return true;
    if (flags & ReactiveFlags$1.Pending) if (checkDirty(this.deps, this)) {
      this.flags = flags | ReactiveFlags$1.Dirty;
      return true;
    } else this.flags = flags & ~ReactiveFlags$1.Pending;
    return false;
  }
  /**
  * @internal
  * for backwards compat
  */
  set _dirty(v) {
    if (v) this.flags |= ReactiveFlags$1.Dirty;
    else this.flags &= ~(ReactiveFlags$1.Dirty | ReactiveFlags$1.Pending);
  }
  constructor(fn, setter) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.subs = void 0;
    this.subsTail = void 0;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = ReactiveFlags$1.Mutable | ReactiveFlags$1.Dirty;
    this.__v_isRef = true;
    this["__v_isReadonly"] = !setter;
  }
  get value() {
    const flags = this.flags;
    if (flags & ReactiveFlags$1.Dirty || flags & ReactiveFlags$1.Pending && checkDirty(this.deps, this)) {
      if (this.update()) {
        const subs = this.subs;
        if (subs !== void 0) shallowPropagate(subs);
      }
    } else if (flags & ReactiveFlags$1.Pending) this.flags = flags & ~ReactiveFlags$1.Pending;
    if (activeSub !== void 0) {
      if (true) onTrack(activeSub, {
        target: this,
        type: "get",
        key: "value"
      });
      link(this, activeSub);
    } else if (activeEffectScope !== void 0) link(this, activeEffectScope);
    return this._value;
  }
  set value(newValue) {
    if (this.setter) this.setter(newValue);
    else if (true) warn("Write operation failed: computed value is readonly");
  }
  update() {
    const prevSub = startTracking(this);
    try {
      const oldValue = this._value;
      const newValue = this.fn(oldValue);
      if (hasChanged(oldValue, newValue)) {
        this._value = newValue;
        return true;
      }
      return false;
    } finally {
      endTracking(this, prevSub);
    }
  }
};
if (true) setupOnTrigger(ComputedRefImpl);
function computed(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) getter = getterOrOptions;
  else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter);
  if (debugOptions && !isSSR) {
    cRef.onTrack = debugOptions.onTrack;
    cRef.onTrigger = debugOptions.onTrigger;
  }
  return cRef;
}
var TrackOpTypes = {
  "GET": "get",
  "HAS": "has",
  "ITERATE": "iterate"
};
var TriggerOpTypes = {
  "SET": "set",
  "ADD": "add",
  "DELETE": "delete",
  "CLEAR": "clear"
};
var INITIAL_WATCHER_VALUE = {};
var activeWatcher = void 0;
function getCurrentWatcher() {
  return activeWatcher;
}
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    const { call } = owner.options;
    if (call) owner.cleanups[owner.cleanupsLength++] = () => call(cleanupFn, 4);
    else owner.cleanups[owner.cleanupsLength++] = cleanupFn;
  } else if (!failSilently) warn("onWatcherCleanup() was called when there was no active watcher to associate with.");
}
var WatcherEffect = class extends ReactiveEffect {
  constructor(source, cb, options = EMPTY_OBJ) {
    const { deep, once, call, onWarn } = options;
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef2(source)) {
      getter = () => source.value;
      forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
      getter = () => reactiveGetter(source, deep);
      forceTrigger = true;
    } else if (isArray(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
      getter = () => source.map((s) => {
        if (isRef2(s)) return s.value;
        else if (isReactive(s)) return reactiveGetter(s, deep);
        else if (isFunction(s)) return call ? call(s, 2) : s();
        else warnInvalidSource(s, onWarn);
      });
    } else if (isFunction(source)) if (cb) getter = call ? () => call(source, 2) : source;
    else getter = () => {
      if (this.cleanupsLength) {
        const prevSub = setActiveSub();
        try {
          cleanup(this);
        } finally {
          setActiveSub(prevSub);
        }
      }
      const currentEffect = activeWatcher;
      activeWatcher = this;
      try {
        return call ? call(source, 3, [this.boundCleanup]) : source(this.boundCleanup);
      } finally {
        activeWatcher = currentEffect;
      }
    };
    else {
      getter = NOOP;
      warnInvalidSource(source, onWarn);
    }
    if (cb && deep) {
      const baseGetter = getter;
      const depth = deep === true ? Infinity : deep;
      getter = () => traverse(baseGetter(), depth);
    }
    super(getter);
    this.cb = cb;
    this.options = options;
    this.boundCleanup = (fn) => onWatcherCleanup(fn, false, this);
    this.forceTrigger = forceTrigger;
    this.isMultiSource = isMultiSource;
    if (once && cb) {
      const _cb = cb;
      cb = (...args) => {
        _cb(...args);
        this.stop();
      };
    }
    this.cb = cb;
    this.oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    if (true) {
      this.onTrack = options.onTrack;
      this.onTrigger = options.onTrigger;
    }
  }
  run(initialRun = false) {
    const oldValue = this.oldValue;
    const newValue = this.oldValue = super.run();
    if (!this.cb) return;
    const { immediate, deep, call } = this.options;
    if (initialRun && !immediate) return;
    if (deep || this.forceTrigger || (this.isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
      cleanup(this);
      const currentWatcher = activeWatcher;
      activeWatcher = this;
      try {
        const args = [
          newValue,
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : this.isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          this.boundCleanup
        ];
        call ? call(this.cb, 3, args) : this.cb(...args);
      } finally {
        activeWatcher = currentWatcher;
      }
    }
  }
};
function reactiveGetter(source, deep) {
  if (deep) return source;
  if (isShallow(source) || deep === false || deep === 0) return traverse(source, 1);
  return traverse(source);
}
function warnInvalidSource(s, onWarn) {
  (onWarn || warn)(`Invalid watch source: `, s, "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.");
}
function watch(source, cb, options = EMPTY_OBJ) {
  const effect2 = new WatcherEffect(source, cb, options);
  effect2.run(true);
  const stop2 = effect2.stop.bind(effect2);
  stop2.pause = effect2.pause.bind(effect2);
  stop2.resume = effect2.resume.bind(effect2);
  stop2.stop = stop2;
  return stop2;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) return value;
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) return value;
  seen.set(value, depth);
  depth--;
  if (isRef2(value)) traverse(value.value, depth, seen);
  else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
  else if (isSet(value) || isMap(value)) value.forEach((v) => {
    traverse(v, depth, seen);
  });
  else if (isPlainObject(value)) {
    for (const key in value) traverse(value[key], depth, seen);
    for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
  }
  return value;
}

// node_modules/.pnpm/@vue+runtime-core@3.6.0-beta.7/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var stack = [];
function pushWarningContext(ctx) {
  stack.push(ctx);
}
function popWarningContext() {
  stack.pop();
}
var isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  const prevSub = setActiveSub();
  const entry = stack.length ? stack[stack.length - 1] : null;
  const instance = isVNode(entry) ? entry.component : entry;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) callWithErrorHandling(appWarnHandler, instance, 11, [
    msg + args.map((a) => {
      var _a$toString, _a$toString2;
      return (_a$toString = (_a$toString2 = a.toString) === null || _a$toString2 === void 0 ? void 0 : _a$toString2.call(a)) !== null && _a$toString !== void 0 ? _a$toString : JSON.stringify(a);
    }).join(""),
    instance && instance.proxy || instance,
    trace.map(({ ctx }) => `at <${formatComponentName(instance, ctx.type)}>`).join("\n"),
    trace
  ]);
  else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && true)
      warnArgs.push(`
`, ...formatTrace(trace));
    console.warn(...warnArgs);
  }
  setActiveSub(prevSub);
  isWarning = false;
}
function getComponentTrace() {
  let currentCtx = stack[stack.length - 1];
  if (!currentCtx) return [];
  const normalizedStack = [];
  while (currentCtx) {
    const last = normalizedStack[0];
    if (last && last.ctx === currentCtx) last.recurseCount++;
    else normalizedStack.push({
      ctx: currentCtx,
      recurseCount: 0
    });
    if (isVNode(currentCtx)) {
      const parent = currentCtx.component && currentCtx.component.parent;
      currentCtx = parent && parent.vnode || parent;
    } else currentCtx = currentCtx.parent;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ ctx, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const instance = isVNode(ctx) ? ctx.component : ctx;
  const isRoot = instance ? instance.parent == null : false;
  const open = ` at <${formatComponentName(instance, ctx.type, isRoot)}`;
  const close = `>` + postfix;
  return ctx.props ? [
    open,
    ...formatProps(ctx.props),
    close
  ] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) res.push(` ...`);
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) return raw ? value : [`${key}=${value}`];
  else if (isRef2(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [
      `${key}=Ref<`,
      value,
      `>`
    ];
  } else if (isFunction(value)) return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function assertNumber(val, type) {
  if (false) return;
  if (val === void 0) return;
  else if (typeof val !== "number") warn$1(`${type} is not a valid number - got ${JSON.stringify(val)}.`);
  else if (isNaN(val)) warn$1(`${type} is NaN - the duration expression might be incorrect.`);
}
var ErrorCodes = {
  "SETUP_FUNCTION": 0,
  "0": "SETUP_FUNCTION",
  "RENDER_FUNCTION": 1,
  "1": "RENDER_FUNCTION",
  "NATIVE_EVENT_HANDLER": 5,
  "5": "NATIVE_EVENT_HANDLER",
  "COMPONENT_EVENT_HANDLER": 6,
  "6": "COMPONENT_EVENT_HANDLER",
  "VNODE_HOOK": 7,
  "7": "VNODE_HOOK",
  "DIRECTIVE_HOOK": 8,
  "8": "DIRECTIVE_HOOK",
  "TRANSITION_HOOK": 9,
  "9": "TRANSITION_HOOK",
  "APP_ERROR_HANDLER": 10,
  "10": "APP_ERROR_HANDLER",
  "APP_WARN_HANDLER": 11,
  "11": "APP_WARN_HANDLER",
  "FUNCTION_REF": 12,
  "12": "FUNCTION_REF",
  "ASYNC_COMPONENT_LOADER": 13,
  "13": "ASYNC_COMPONENT_LOADER",
  "SCHEDULER": 14,
  "14": "SCHEDULER",
  "COMPONENT_UPDATE": 15,
  "15": "COMPONENT_UPDATE",
  "APP_UNMOUNT_CLEANUP": 16,
  "16": "APP_UNMOUNT_CLEANUP"
};
var ErrorTypeStrings$1 = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush",
  [15]: "component update",
  [16]: "app unmount cleanup function"
};
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) res.catch((err) => {
      handleError(err, instance, type);
    });
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    return values;
  } else if (true) warn$1(`Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`);
}
function handleError(err, instance, type, throwInDev = true) {
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy || instance;
    const errorInfo = true ? ErrorTypeStrings$1[type] : `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      const prevSub = setActiveSub();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      setActiveSub(prevSub);
      return;
    }
  }
  logError(err, type, instance, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, instance, throwInDev = true, throwInProd = false) {
  if (true) {
    const info = ErrorTypeStrings$1[type];
    if (instance) pushWarningContext(instance);
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (instance) popWarningContext();
    if (throwInDev) throw err;
    else console.error(err);
  } else if (throwInProd) throw err;
  else console.error(err);
}
var SchedulerJobFlags = {
  "QUEUED": 1,
  "1": "QUEUED",
  "ALLOW_RECURSE": 2,
  "2": "ALLOW_RECURSE",
  "DISPOSED": 4,
  "4": "DISPOSED"
};
var jobs = [];
var postJobs = [];
var activePostJobs = null;
var currentFlushPromise = null;
var jobsLength = 0;
var flushIndex = 0;
var postFlushIndex = 0;
var resolvedPromise = Promise.resolve();
var RECURSION_LIMIT = 100;
function nextTick(fn) {
  const p3 = currentFlushPromise || resolvedPromise;
  return fn ? p3.then(this ? fn.bind(this) : fn) : p3;
}
function findInsertionIndex(order, queue, start, end) {
  while (start < end) {
    const middle = start + end >>> 1;
    if (queue[middle].order <= order) start = middle + 1;
    else end = middle;
  }
  return start;
}
function queueJob(job, id, isPre = false) {
  if (queueJobWorker(job, id === void 0 ? isPre ? -2 : Infinity : isPre ? id * 2 : id * 2 + 1, jobs, jobsLength, flushIndex)) {
    jobsLength++;
    queueFlush();
  }
}
function queueJobWorker(job, order, queue, length, flushIndex2) {
  const flags = job.flags;
  if (!(flags & 1)) {
    job.flags = flags | 1;
    job.order = order;
    if (flushIndex2 === length || order >= queue[length - 1].order) queue[length] = job;
    else queue.splice(findInsertionIndex(order, queue, flushIndex2, length), 0, job);
    return true;
  }
  return false;
}
var doFlushJobs = () => {
  try {
    flushJobs();
  } catch (e) {
    currentFlushPromise = null;
    throw e;
  }
};
function queueFlush() {
  if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(doFlushJobs);
}
function queuePostFlushCb(jobs2, id = Infinity) {
  if (!isArray(jobs2)) if (activePostJobs && id === -1) activePostJobs.splice(postFlushIndex, 0, jobs2);
  else queueJobWorker(jobs2, id, postJobs, postJobs.length, 0);
  else for (const job of jobs2) queueJobWorker(job, id, postJobs, postJobs.length, 0);
  queueFlush();
}
function flushPreFlushCbs(instance, seen) {
  if (true) seen = seen || /* @__PURE__ */ new Map();
  for (let i = flushIndex; i < jobsLength; i++) {
    const cb = jobs[i];
    if (cb.order & 1 || cb.order === Infinity) continue;
    if (instance && cb.order !== instance.uid * 2) continue;
    if (checkRecursiveUpdates(seen, cb)) continue;
    jobs.splice(i, 1);
    i--;
    jobsLength--;
    if (cb.flags & 2) cb.flags &= -2;
    cb();
    if (!(cb.flags & 2)) cb.flags &= -2;
  }
}
function flushPostFlushCbs(seen) {
  if (postJobs.length) {
    if (activePostJobs) {
      activePostJobs.push(...postJobs);
      postJobs.length = 0;
      return;
    }
    activePostJobs = postJobs;
    postJobs = [];
    if (true) seen = seen || /* @__PURE__ */ new Map();
    while (postFlushIndex < activePostJobs.length) {
      const cb = activePostJobs[postFlushIndex++];
      if (checkRecursiveUpdates(seen, cb)) continue;
      if (cb.flags & 2) cb.flags &= -2;
      if (!(cb.flags & 4)) try {
        cb();
      } finally {
        cb.flags &= -2;
      }
    }
    activePostJobs = null;
    postFlushIndex = 0;
  }
}
var isFlushing = false;
function flushOnAppMount(instance) {
  if (!isFlushing) {
    isFlushing = true;
    flushPreFlushCbs(instance);
    flushPostFlushCbs();
    isFlushing = false;
  }
}
function flushJobs(seen) {
  if (true) seen || (seen = /* @__PURE__ */ new Map());
  try {
    while (flushIndex < jobsLength) {
      const job = jobs[flushIndex];
      jobs[flushIndex++] = void 0;
      if (!(job.flags & 4)) {
        if (checkRecursiveUpdates(seen, job)) continue;
        if (job.flags & 2) job.flags &= -2;
        try {
          job();
        } catch (err) {
          handleError(err, job.i, job.i ? 15 : 14);
        } finally {
          if (!(job.flags & 2)) job.flags &= -2;
        }
      }
    }
  } finally {
    while (flushIndex < jobsLength) {
      jobs[flushIndex].flags &= -2;
      jobs[flushIndex++] = void 0;
    }
    flushIndex = 0;
    jobsLength = 0;
    flushPostFlushCbs(seen);
    currentFlushPromise = null;
    if (jobsLength || postJobs.length) flushJobs(seen);
  }
}
function checkRecursiveUpdates(seen, fn) {
  const count = seen.get(fn) || 0;
  if (count > RECURSION_LIMIT) {
    const instance = fn.i;
    const componentName = instance && getComponentName(instance.type);
    handleError(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10);
    return true;
  }
  seen.set(fn, count + 1);
  return false;
}
var isHmrUpdating = false;
var hmrDirtyComponents = /* @__PURE__ */ new Map();
var hmrDirtyComponentsMode = /* @__PURE__ */ new Map();
if (true) getGlobalThis().__VUE_HMR_RUNTIME__ = {
  createRecord: tryWrap(createRecord),
  rerender: tryWrap(rerender),
  reload: tryWrap(reload)
};
var map = /* @__PURE__ */ new Map();
function registerHMR(instance) {
  const id = instance.type.__hmrId;
  let record = map.get(id);
  if (!record) {
    createRecord(id, instance.type);
    record = map.get(id);
  }
  record.instances.add(instance);
}
function unregisterHMR(instance) {
  map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
  if (map.has(id)) return false;
  map.set(id, {
    initialDef: normalizeClassComponent(initialDef),
    instances: /* @__PURE__ */ new Set()
  });
  return true;
}
function normalizeClassComponent(component) {
  return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
  const record = map.get(id);
  if (!record) return;
  record.initialDef.render = newRender;
  [...record.instances].forEach((instance) => {
    if (newRender) {
      instance.render = newRender;
      normalizeClassComponent(instance.type).render = newRender;
    }
    isHmrUpdating = true;
    if (instance.vapor) {
      if (!instance.isUnmounted) instance.hmrRerender();
    } else {
      const i = instance;
      if (!(i.effect.flags & 1024)) {
        i.renderCache = [];
        i.effect.run();
      }
    }
    nextTick(() => {
      isHmrUpdating = false;
    });
  });
}
function reload(id, newComp) {
  const record = map.get(id);
  if (!record) return;
  newComp = normalizeClassComponent(newComp);
  const isVapor = record.initialDef.__vapor;
  updateComponentDef(record.initialDef, newComp);
  const instances = [...record.instances];
  if (isVapor && newComp.__vapor && !instances.some((i) => i.ceReload)) {
    for (const instance of instances) if (instance.root && instance.root.ce && instance !== instance.root) instance.root.ce._removeChildStyle(instance.type);
    for (const instance of instances) instance.hmrReload(newComp);
  } else for (const instance of instances) {
    const oldComp = normalizeClassComponent(instance.type);
    let dirtyInstances = hmrDirtyComponents.get(oldComp);
    if (!dirtyInstances) {
      if (oldComp !== record.initialDef) updateComponentDef(oldComp, newComp);
      hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
    }
    dirtyInstances.add(instance);
    hmrDirtyComponentsMode.set(oldComp, !!isVapor);
    instance.appContext.propsCache.delete(instance.type);
    instance.appContext.emitsCache.delete(instance.type);
    instance.appContext.optionsCache.delete(instance.type);
    if (instance.ceReload) {
      dirtyInstances.add(instance);
      instance.ceReload(newComp.styles);
      dirtyInstances.delete(instance);
    } else if (instance.parent) queueJob(() => {
      isHmrUpdating = true;
      const parent = instance.parent;
      if (parent.vapor) parent.hmrRerender();
      else if (!(parent.effect.flags & 1024)) {
        parent.renderCache = [];
        parent.effect.run();
      }
      nextTick(() => {
        isHmrUpdating = false;
      });
      dirtyInstances.delete(instance);
    });
    else if (instance.appContext.reload) instance.appContext.reload();
    else if (typeof window !== "undefined") window.location.reload();
    else console.warn("[HMR] Root or manually mounted instance modified. Full reload required.");
    if (instance.root.ce && instance !== instance.root) instance.root.ce._removeChildStyle(oldComp);
  }
  queuePostFlushCb(() => {
    hmrDirtyComponents.clear();
    hmrDirtyComponentsMode.clear();
  });
}
function updateComponentDef(oldComp, newComp) {
  extend(oldComp, newComp);
  for (const key in oldComp) if (key !== "__file" && !(key in newComp)) delete oldComp[key];
}
function tryWrap(fn) {
  return (id, arg) => {
    try {
      return fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn("[HMR] Something went wrong during Vue component hot-reload. Full reload required.");
    }
  };
}
var devtools$1;
var buffer = [];
var devtoolsNotInstalled = false;
function emit$1(event, ...args) {
  if (devtools$1) devtools$1.emit(event, ...args);
  else if (!devtoolsNotInstalled) buffer.push({
    event,
    args
  });
}
function setDevtoolsHook$1(hook, target) {
  var _window$navigator;
  devtools$1 = hook;
  if (devtools$1) {
    devtools$1.enabled = true;
    buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
    buffer = [];
  } else if (typeof window !== "undefined" && window.HTMLElement && !((_window$navigator = window.navigator) === null || _window$navigator === void 0 || (_window$navigator = _window$navigator.userAgent) === null || _window$navigator === void 0 ? void 0 : _window$navigator.includes("jsdom"))) {
    (target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((newHook) => {
      setDevtoolsHook$1(newHook, target);
    });
    setTimeout(() => {
      if (!devtools$1) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        devtoolsNotInstalled = true;
        buffer = [];
      }
    }, 3e3);
  } else {
    devtoolsNotInstalled = true;
    buffer = [];
  }
}
function devtoolsInitApp(app, version2) {
  emit$1("app:init", app, version2, {
    Fragment,
    Text: Text2,
    Comment: Comment2,
    Static
  });
}
function devtoolsUnmountApp(app) {
  emit$1("app:unmount", app);
}
var devtoolsComponentAdded = createDevtoolsComponentHook("component:added");
var devtoolsComponentUpdated = createDevtoolsComponentHook("component:updated");
var _devtoolsComponentRemoved = createDevtoolsComponentHook("component:removed");
var devtoolsComponentRemoved = (component) => {
  if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && !devtools$1.cleanupBuffer(component)) _devtoolsComponentRemoved(component);
};
function createDevtoolsComponentHook(hook) {
  return (component) => {
    emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : void 0, component);
  };
}
var devtoolsPerfStart = createDevtoolsPerformanceHook("perf:start");
var devtoolsPerfEnd = createDevtoolsPerformanceHook("perf:end");
function createDevtoolsPerformanceHook(hook) {
  return (component, type, time) => {
    emit$1(hook, component.appContext.app, component.uid, component, type, time);
  };
}
function devtoolsComponentEmit(component, event, params) {
  emit$1("component:emit", component.appContext.app, component, event, params);
}
var currentRenderingInstance = null;
var currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
var withScopeId = (_id) => withCtx;
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) return fn;
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) setBlockTracking(-1);
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) setBlockTracking(1);
    }
    if (true) devtoolsComponentUpdated(ctx);
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function validateDirectiveName(name) {
  if (isBuiltInDirective(name)) warn$1("Do not use built-in directive ids as custom directive id: " + name);
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    warn$1(`withDirectives can only be used inside render functions.`);
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) dir = {
        mounted: dir,
        updated: dir
      };
      if (dir.deep) traverse(value);
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) binding.oldValue = oldBindings[i].value;
    let hook = binding.dir[name];
    if (hook) {
      const prevSub = setActiveSub();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      setActiveSub(prevSub);
    }
  }
}
function provide(key, value) {
  if (true) {
    if (!currentInstance || currentInstance.isMounted && !isHmrUpdating) warn$1(`provide() can only be used inside setup().`);
  }
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentGenericInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.appContext && instance.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) return provides[key];
    else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    else if (true) warn$1(`injection "${String(key)}" not found.`);
  } else if (true) warn$1(`inject() can only be used inside setup() or functional components.`);
}
function hasInjectionContext() {
  return !!(getCurrentGenericInstance() || currentApp);
}
var ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
var useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    if (!ctx) warn$1("Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.");
    return ctx;
  }
};
function watchEffect(effect2, options) {
  return doWatch(effect2, null, options);
}
function watchPostEffect(effect2, options) {
  return doWatch(effect2, null, true ? extend({}, options, { flush: "post" }) : { flush: "post" });
}
function watchSyncEffect(effect2, options) {
  return doWatch(effect2, null, true ? extend({}, options, { flush: "sync" }) : { flush: "sync" });
}
function watch2(source, cb, options) {
  if (!isFunction(cb)) warn$1("`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature.");
  return doWatch(source, cb, options);
}
var RenderWatcherEffect = class extends WatcherEffect {
  constructor(instance, source, cb, options, flush2) {
    super(source, cb, options);
    this.flush = flush2;
    const job = () => {
      if (this.dirty) this.run();
    };
    if (cb) {
      this.flags |= 128;
      job.flags |= 2;
    }
    if (instance) job.i = instance;
    this.job = job;
  }
  notify() {
    if (!(this.flags & 256)) {
      const flush2 = this.flush;
      const job = this.job;
      if (flush2 === "post") queuePostRenderEffect(job, void 0, job.i ? job.i.suspense : null);
      else if (flush2 === "pre") queueJob(job, job.i ? job.i.uid : void 0, true);
      else job();
    }
  }
};
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush: flush2 = "pre", once } = options;
  if (!cb) {
    if (immediate !== void 0) warn$1('watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.');
    if (deep !== void 0) warn$1('watch() "deep" option is only respected when using the watch(source, callback, options?) signature.');
    if (once !== void 0) warn$1('watch() "once" option is only respected when using the watch(source, callback, options?) signature.');
  }
  const baseWatchOptions = extend({}, options);
  if (true) baseWatchOptions.onWarn = warn$1;
  const runsImmediately = cb && immediate || !cb && flush2 !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush2 === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  const effect2 = new RenderWatcherEffect(instance, source, cb, baseWatchOptions, flush2);
  if (cb) effect2.run(true);
  else if (flush2 === "post") queuePostRenderEffect(effect2.job, void 0, instance && instance.suspense);
  else effect2.run(true);
  const stop2 = effect2.stop.bind(effect2);
  stop2.pause = effect2.pause.bind(effect2);
  stop2.resume = effect2.resume.bind(effect2);
  stop2.stop = stop2;
  if (isInSSRComponentSetup) {
    if (ssrCleanup) ssrCleanup.push(stop2);
    else if (runsImmediately) stop2();
  }
  return stop2;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) cb = value;
  else {
    cb = value.handler;
    options = value;
  }
  const prev = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  setCurrentInstance(...prev);
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
    return cur;
  };
}
var TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
var isTeleport = (type) => type.__isTeleport;
var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
var resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString(targetSelector)) if (!select) {
    warn$1("Current renderer does not support string target for Teleports. (missing querySelector renderer option)");
    return null;
  } else {
    const target = select(targetSelector);
    if (!target && !isTeleportDisabled(props)) warn$1(`Failed to locate Teleport target with selector "${targetSelector}". Note the target element must exist before the component is mounted - i.e. the target cannot be rendered by the component itself, and ideally should be outside of the entire Vue component tree.`);
    return target;
  }
  else {
    if (!targetSelector && !isTeleportDisabled(props)) warn$1(`Invalid Teleport target: ${targetSelector}`);
    return targetSelector;
  }
};
var TeleportImpl = {
  name: "Teleport",
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, internals) {
    const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert: insert2, querySelector: querySelector2, createText, createComment: createComment2 } } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { shapeFlag, children, dynamicChildren } = n2;
    if (isHmrUpdating) {
      optimized = false;
      dynamicChildren = null;
    }
    if (n1 == null) {
      const placeholder = n2.el = true ? createComment2("teleport start") : createText("");
      const mainAnchor = n2.anchor = true ? createComment2("teleport end") : createText("");
      insert2(placeholder, container, anchor);
      insert2(mainAnchor, container, anchor);
      const mount = (container2, anchor2) => {
        if (shapeFlag & 16) mountChildren(children, container2, anchor2, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
      };
      const mountToTarget = () => {
        const target = n2.target = resolveTarget(n2.props, querySelector2);
        const targetAnchor = prepareAnchor(target, n2, createText, insert2);
        if (target) {
          if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
          else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
          if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
          if (!disabled) {
            mount(target, targetAnchor);
            updateCssVars(n2, false);
          }
        } else if (!disabled) warn$1("Invalid Teleport target on mount:", target, `(${typeof target})`);
      };
      if (disabled) {
        mount(container, mainAnchor);
        updateCssVars(n2, true);
      }
      if (isTeleportDeferred(n2.props)) {
        n2.el.__isMounted = false;
        queuePostRenderEffect(() => {
          mountToTarget();
          delete n2.el.__isMounted;
        }, void 0, parentSuspense2);
      } else mountToTarget();
    } else {
      if (isTeleportDeferred(n2.props) && n1.el.__isMounted === false) {
        queuePostRenderEffect(() => {
          TeleportImpl.process(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, internals);
        }, void 0, parentSuspense2);
        return;
      }
      n2.el = n1.el;
      n2.targetStart = n1.targetStart;
      const mainAnchor = n2.anchor = n1.anchor;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
      else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
      if (dynamicChildren) {
        patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense2, namespace, slotScopeIds);
        traverseStaticChildren(n1, n2, false);
      } else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense2, namespace, slotScopeIds, false);
      if (disabled) {
        if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, parentComponent, 1);
        else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
      } else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
        const nextTarget = n2.target = resolveTarget(n2.props, querySelector2);
        if (nextTarget) moveTeleport(n2, nextTarget, null, internals, parentComponent, 0);
        else if (true) warn$1("Invalid Teleport target on update:", target, `(${typeof target})`);
      } else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, parentComponent, 1);
      updateCssVars(n2, disabled);
    }
  },
  remove(vnode, parentComponent, parentSuspense2, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
    if (target) {
      hostRemove(targetStart);
      hostRemove(targetAnchor);
    }
    doRemove && hostRemove(anchor);
    if (shapeFlag & 16) {
      const shouldRemove = doRemove || !isTeleportDisabled(props);
      for (let i = 0; i < children.length; i++) {
        const child2 = children[i];
        unmount(child2, parentComponent, parentSuspense2, shouldRemove, !!child2.dynamicChildren);
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert: insert2 }, m: move2 }, parentComponent, moveType = 2) {
  if (moveType === 0) insert2(vnode.targetAnchor, container, parentAnchor);
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) insert2(el, container, parentAnchor);
  if (!isReorder || isTeleportDisabled(props)) {
    if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move2(children[i], container, parentAnchor, 2, parentComponent);
  }
  if (isReorder) insert2(anchor, container, parentAnchor);
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized, { o: { nextSibling, parentNode: parentNode2, querySelector: querySelector2, insert: insert2, createText } }, hydrateChildren) {
  function hydrateAnchor(target2, targetNode) {
    let targetAnchor = targetNode;
    while (targetAnchor) {
      if (targetAnchor && targetAnchor.nodeType === 8) {
        if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
        else if (targetAnchor.data === "teleport anchor") {
          vnode.targetAnchor = targetAnchor;
          target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
          break;
        }
      }
      targetAnchor = nextSibling(targetAnchor);
    }
  }
  function hydrateDisabledTeleport(node2, vnode2) {
    vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode2(node2), parentComponent, parentSuspense2, slotScopeIds, optimized);
  }
  const target = vnode.target = resolveTarget(vnode.props, querySelector2);
  const disabled = isTeleportDisabled(vnode.props);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) if (disabled) {
      hydrateDisabledTeleport(node, vnode);
      hydrateAnchor(target, targetNode);
      if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert2, parentNode2(node) === target ? node : null);
    } else {
      vnode.anchor = nextSibling(node);
      hydrateAnchor(target, targetNode);
      if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert2);
      hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense2, slotScopeIds, optimized);
    }
    updateCssVars(vnode, disabled);
  } else if (disabled) {
    if (vnode.shapeFlag & 16) {
      hydrateDisabledTeleport(node, vnode);
      vnode.targetStart = node;
      vnode.targetAnchor = nextSibling(node);
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
var Teleport = TeleportImpl;
function updateCssVars(vnode, isDisabled) {
  const ctx = vnode.ctx;
  if (ctx && ctx.ut) {
    let node, anchor;
    if (isDisabled) {
      node = vnode.el;
      anchor = vnode.anchor;
    } else {
      node = vnode.targetStart;
      anchor = vnode.targetAnchor;
    }
    while (node && node !== anchor) {
      if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
      node = node.nextSibling;
    }
    ctx.ut();
  }
}
function prepareAnchor(target, vnode, createText, insert2, anchor = null) {
  const targetStart = vnode.targetStart = createText("");
  const targetAnchor = vnode.targetAnchor = createText("");
  targetStart[TeleportEndKey] = targetAnchor;
  if (target) {
    insert2(targetStart, target, anchor);
    insert2(targetAnchor, target, anchor);
  }
  return targetAnchor;
}
var leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
var enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
var TransitionHookValidator = [Function, Array];
var BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
var recursiveGetSubtree = (instance) => {
  const subTree = isVaporComponent(instance.type) ? instance.block : instance.subTree;
  return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
};
var BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) return;
      const child2 = findNonCommentChild(children);
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      checkTransitionMode(mode);
      if (state.isLeaving) return emptyPlaceholder(child2);
      const innerChild = getInnerChild$1(child2);
      if (!innerChild) return emptyPlaceholder(child2);
      let enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance, (hooks) => enterHooks = hooks);
      if (innerChild.type !== Comment2) setTransitionHooks(innerChild, enterHooks);
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment2 && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment2) {
        let leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment2) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 4)) instance.update();
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child2);
        } else if (mode === "in-out" && innerChild.type !== Comment2) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
          const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
          leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
          el[leaveCbKey] = () => {
            earlyRemove();
            el[leaveCbKey] = void 0;
            delete enterHooks.delayedLeave;
            oldInnerChild = void 0;
          };
          enterHooks.delayedLeave = () => {
            delayedLeave();
            delete enterHooks.delayedLeave;
            oldInnerChild = void 0;
          };
        };
        else oldInnerChild = void 0;
      } else if (oldInnerChild) oldInnerChild = void 0;
      return child2;
    };
  }
};
function findNonCommentChild(children) {
  let child2 = children[0];
  if (children.length > 1) {
    let hasFound = false;
    for (const c of children) if (c.type !== Comment2) {
      if (hasFound) {
        warn$1("<transition> can only be used on a single element or component. Use <transition-group> for lists.");
        break;
      }
      child2 = c;
      hasFound = true;
      if (false) break;
    }
  }
  return child2;
}
var BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingNodes } = state;
  let leavingVNodesCache = leavingNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  return baseResolveTransitionHooks({
    isLeaving: () => leavingVNodesCache[key] === vnode,
    setLeavingNodeCache: () => {
      leavingVNodesCache[key] = vnode;
    },
    unsetLeavingNodeCache: () => {
      if (leavingVNodesCache[key] === vnode) delete leavingVNodesCache[key];
    },
    earlyRemove: () => {
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
    },
    cloneHooks: (vnode2) => {
      const hooks = resolveTransitionHooks(vnode2, props, state, instance, postClone);
      if (postClone) postClone(hooks);
      return hooks;
    }
  }, props, state, instance);
}
function baseResolveTransitionHooks(context, props, state, instance) {
  const { isLeaving, setLeavingNodeCache, unsetLeavingNodeCache, earlyRemove, cloneHooks } = context;
  const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
  const callHook3 = (hook, args) => {
    hook && callWithAsyncErrorHandling(hook, instance, 9, args);
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook3(hook, args);
    if (isArray(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) done();
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) if (appear) hook = onBeforeAppear || onBeforeEnter;
      else return;
      if (el[leaveCbKey]) el[leaveCbKey](true);
      earlyRemove();
      callHook3(hook, [el]);
    },
    enter(el) {
      if (isLeaving()) return;
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) if (appear) {
        hook = onAppear || onEnter;
        afterHook = onAfterAppear || onAfterEnter;
        cancelHook = onAppearCancelled || onEnterCancelled;
      } else return;
      let called = false;
      el[enterCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) callHook3(cancelHook, [el]);
        else callHook3(afterHook, [el]);
        if (hooks.delayedLeave) hooks.delayedLeave();
        el[enterCbKey] = void 0;
      };
      const done = el[enterCbKey].bind(null, false);
      if (hook) callAsyncHook(hook, [el, done]);
      else done();
    },
    leave(el, remove3) {
      if (el[enterCbKey]) el[enterCbKey](true);
      if (state.isUnmounting) return remove3();
      callHook3(onBeforeLeave, [el]);
      let called = false;
      el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove3();
        if (cancelled) callHook3(onLeaveCancelled, [el]);
        else callHook3(onAfterLeave, [el]);
        el[leaveCbKey] = void 0;
        unsetLeavingNodeCache(el);
      };
      setLeavingNodeCache(el);
      const done = el[leaveCbKey].bind(null, false);
      if (onLeave) callAsyncHook(onLeave, [el, done]);
      else done();
    },
    clone(node) {
      return cloneHooks(node);
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) return findNonCommentChild(vnode.children);
    return vnode;
  }
  if (vnode.component) return vnode.component.subTree;
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) return children[0];
    if (shapeFlag & 32 && isFunction(children.default)) return children.default();
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) if (isVaporComponent(vnode.type)) getVaporInterface(vnode.component, vnode).setTransitionHooks(vnode.component, hooks);
  else {
    vnode.transition = hooks;
    setTransitionHooks(vnode.component.subTree, hooks);
  }
  else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else vnode.transition = hooks;
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child2 = children[i];
    const key = parentKey == null ? child2.key : String(parentKey) + String(child2.key != null ? child2.key : i);
    if (child2.type === Fragment) {
      if (child2.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(getTransitionRawChildren(child2.children, keepComment, key));
    } else if (keepComment || child2.type !== Comment2) ret.push(key != null ? cloneVNode(child2, { key }) : child2);
  }
  if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
  return ret;
}
function checkTransitionMode(mode) {
  if (mode && mode !== "in-out" && mode !== "out-in" && mode !== "default") warn$1(`invalid <transition> mode: ${mode}`);
}
function defineComponent(options, extraOptions) {
  return isFunction(options) ? extend({ name: options.name }, extraOptions, { setup: options }) : options;
}
function useId() {
  const i = getCurrentGenericInstance();
  if (i) return (i.appContext.config.idPrefix || "v") + "-" + i.ids[0] + i.ids[1]++;
  else if (true) warn$1("useId() is called when there is no active component instance to be associated with.");
  return "";
}
function markAsyncBoundary(instance) {
  instance.ids = [
    instance.ids[0] + instance.ids[2]++ + "-",
    0,
    0
  ];
}
var knownTemplateRefs = /* @__PURE__ */ new WeakSet();
function useTemplateRef(key) {
  const i = getCurrentGenericInstance();
  const r = shallowRef(null);
  if (i) {
    const refs = i.refs === EMPTY_OBJ ? i.refs = {} : i.refs;
    if (isTemplateRefKey(refs, key)) warn$1(`useTemplateRef('${key}') already exists.`);
    else Object.defineProperty(refs, key, {
      enumerable: true,
      get: () => r.value,
      set: (val) => r.value = val
    });
  } else if (true) warn$1("useTemplateRef() is called when there is no active component instance to be associated with.");
  const ret = true ? readonly(r) : r;
  if (true) knownTemplateRefs.add(ret);
  return ret;
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense2, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense2, vnode, isUnmount));
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense2, vnode.component.subTree);
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref2 } = rawRef;
  if (!owner) {
    warn$1("Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.");
    return;
  }
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const canSetSetupRef = createCanSetSetupRefChecker(setupState, refs);
  const canSetRef = (ref3, key) => {
    if (knownTemplateRefs.has(ref3)) return false;
    if (key && isTemplateRefKey(refs, key)) return false;
    return true;
  };
  if (oldRef != null && oldRef !== ref2) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
    } else if (isRef2(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref2)) callWithErrorHandling(ref2, owner, 12, [value, refs]);
  else {
    const _isString = isString(ref2);
    const _isRef = isRef2(ref2);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref2) ? setupState[ref2] : refs[ref2] : canSetRef(ref2) || !rawRef.k ? ref2.value : refs[rawRef.k];
          if (isUnmount) isArray(existing) && remove(existing, refValue);
          else if (!isArray(existing)) if (_isString) {
            refs[ref2] = [refValue];
            if (canSetSetupRef(ref2)) setupState[ref2] = refs[ref2];
          } else {
            const newVal = [refValue];
            if (canSetRef(ref2, rawRef.k)) ref2.value = newVal;
            if (rawRef.k) refs[rawRef.k] = newVal;
          }
          else if (!existing.includes(refValue)) existing.push(refValue);
        } else if (_isString) {
          refs[ref2] = value;
          if (canSetSetupRef(ref2)) setupState[ref2] = value;
        } else if (_isRef) {
          if (canSetRef(ref2, rawRef.k)) ref2.value = value;
          if (rawRef.k) refs[rawRef.k] = value;
        } else if (true) warn$1("Invalid template ref type:", ref2, `(${typeof ref2})`);
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, -1, parentSuspense2);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    } else if (true) warn$1("Invalid template ref type:", ref2, `(${typeof ref2})`);
  }
}
function createCanSetSetupRefChecker(setupState, refs) {
  const rawSetupState = toRaw(setupState);
  return setupState === void 0 || setupState === EMPTY_OBJ ? NO : (key) => {
    if (true) {
      if (hasOwn(rawSetupState, key) && !isRef2(rawSetupState[key])) warn$1(`Template ref "${key}" used on a non-ref value. It will not work in the production build.`);
      if (knownTemplateRefs.has(rawSetupState[key])) return false;
    }
    if (isTemplateRefKey(refs, key)) return false;
    return hasOwn(rawSetupState, key);
  };
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 4;
    pendingSetRefMap.delete(rawRef);
  }
}
var isHydratingEnabled = false;
function setIsHydratingEnabled(value) {
  isHydratingEnabled = value;
}
var isHydrating = false;
var hasLoggedMismatchError = false;
var logMismatchError = () => {
  if (hasLoggedMismatchError) return;
  console.error("Hydration completed but contains mismatches.");
  hasLoggedMismatchError = true;
};
var isSVGContainer = (container) => container.namespaceURI.includes("svg") && container.tagName !== "foreignObject";
var isMathMLContainer = (container) => container.namespaceURI.includes("MathML");
var getContainerType = (container) => {
  if (container.nodeType !== 1) return void 0;
  if (isSVGContainer(container)) return "svg";
  if (isMathMLContainer(container)) return "mathml";
};
var isComment = (node) => node.nodeType === 8;
function createHydrationFunctions(rendererInternals) {
  const { mt: mountComponent2, p: patch, o: { patchProp: patchProp2, createText, nextSibling, parentNode: parentNode2, remove: remove3, insert: insert2, createComment: createComment2 } } = rendererInternals;
  const hydrate2 = (vnode, container) => {
    if (!isHydratingEnabled) return;
    if (!container.hasChildNodes()) {
      warn$1("Attempting to hydrate existing markup but container is empty. Performing full mount instead.");
      patch(null, vnode, container);
      flushPostFlushCbs();
      container._vnode = vnode;
      return;
    }
    isHydrating = true;
    hydrateNode2(container.firstChild, vnode, null, null, null);
    isHydrating = false;
    flushPostFlushCbs();
    container._vnode = vnode;
  };
  const hydrateNode2 = (node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized = false) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const isFragmentStart = isComment(node) && node.data === "[";
    const onMismatch = () => handleMismatch2(node, vnode, parentComponent, parentSuspense2, slotScopeIds, isFragmentStart);
    const { type, ref: ref2, shapeFlag, patchFlag } = vnode;
    let domType = node.nodeType;
    vnode.el = node;
    if (true) {
      def(node, "__vnode", vnode, true);
      def(node, "__vueParentComponent", parentComponent, true);
    }
    if (patchFlag === -2) {
      optimized = false;
      vnode.dynamicChildren = null;
    }
    let nextNode = null;
    switch (type) {
      case Text2:
        if (domType !== 3) if (vnode.children === "") {
          insert2(vnode.el = createText(""), parentNode2(node), node);
          nextNode = node;
        } else nextNode = onMismatch();
        else {
          if (node.data !== vnode.children) {
            warn$1(`Hydration text mismatch in`, node.parentNode, `
  - rendered on server: ${JSON.stringify(node.data)}
  - expected on client: ${JSON.stringify(vnode.children)}`);
            logMismatchError();
            node.data = vnode.children;
          }
          nextNode = nextSibling(node);
        }
        break;
      case Comment2:
        if (isTemplateNode(node)) {
          nextNode = nextSibling(node);
          replaceNode(vnode.el = node.content.firstChild, node, parentComponent);
        } else if (domType !== 8 || isFragmentStart) nextNode = onMismatch();
        else nextNode = nextSibling(node);
        break;
      case Static:
        if (isFragmentStart) {
          node = nextSibling(node);
          domType = node.nodeType;
        }
        if (domType === 1 || domType === 3) {
          nextNode = node;
          const needToAdoptContent = !vnode.children.length;
          for (let i = 0; i < vnode.staticCount; i++) {
            if (needToAdoptContent) vnode.children += nextNode.nodeType === 1 ? nextNode.outerHTML : nextNode.data;
            if (i === vnode.staticCount - 1) vnode.anchor = nextNode;
            nextNode = nextSibling(nextNode);
          }
          return isFragmentStart ? nextSibling(nextNode) : nextNode;
        } else onMismatch();
        break;
      case Fragment:
        if (!isFragmentStart) nextNode = onMismatch();
        else nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized);
        break;
      case VaporSlot:
        nextNode = getVaporInterface(parentComponent, vnode).hydrateSlot(vnode, node);
        break;
      default:
        if (shapeFlag & 1) if ((domType !== 1 || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) && !isTemplateNode(node)) nextNode = onMismatch();
        else nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized);
        else if (shapeFlag & 6) {
          vnode.slotScopeIds = slotScopeIds;
          const container = parentNode2(node);
          if (isFragmentStart) nextNode = locateClosingAnchor(node);
          else if (isComment(node) && node.data === "teleport start") nextNode = locateClosingAnchor(node, node.data, "teleport end");
          else nextNode = nextSibling(node);
          if (vnode.type.__vapor) getVaporInterface(parentComponent, vnode).hydrate(vnode, node, container, null, parentComponent, parentSuspense2);
          else mountComponent2(vnode, container, null, parentComponent, parentSuspense2, getContainerType(container), optimized);
          if (isAsyncWrapper(vnode) && !vnode.type.__asyncResolved) {
            let subTree;
            if (isFragmentStart) {
              subTree = createVNode(Fragment);
              subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
            } else subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
            subTree.el = node;
            vnode.component.subTree = subTree;
          }
        } else if (shapeFlag & 64) if (domType !== 8) nextNode = onMismatch();
        else nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized, rendererInternals, hydrateChildren);
        else if (shapeFlag & 128) nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense2, getContainerType(parentNode2(node)), slotScopeIds, optimized, rendererInternals, hydrateNode2);
        else if (true) warn$1("Invalid HostVNode type:", type, `(${typeof type})`);
    }
    if (ref2 != null) setRef(ref2, null, parentSuspense2, vnode);
    return nextNode;
  };
  const hydrateElement = (el, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const { type, props, patchFlag, shapeFlag, dirs, transition } = vnode;
    const forcePatch = type === "input" || type === "option";
    if (true) {
      if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
      let needCallTransitionHooks = false;
      if (isTemplateNode(el)) {
        needCallTransitionHooks = needTransition(null, transition) && parentComponent && parentComponent.vnode.props && parentComponent.vnode.props.appear;
        const content = el.content.firstChild;
        if (needCallTransitionHooks) {
          const cls = content.getAttribute("class");
          if (cls) content.$cls = cls;
          transition.beforeEnter(content);
        }
        replaceNode(content, el, parentComponent);
        vnode.el = el = content;
      }
      if (shapeFlag & 16 && !(props && (props.innerHTML || props.textContent))) {
        let next2 = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense2, slotScopeIds, optimized);
        let hasWarned2 = false;
        while (next2) {
          if (!isMismatchAllowed(el, 1)) {
            if (!hasWarned2) {
              warn$1(`Hydration children mismatch on`, el, `
Server rendered element contains more child nodes than client vdom.`);
              hasWarned2 = true;
            }
            logMismatchError();
          }
          const cur = next2;
          next2 = next2.nextSibling;
          remove3(cur);
        }
      } else if (shapeFlag & 8) {
        let clientText = vnode.children;
        if (clientText[0] === "\n" && (el.tagName === "PRE" || el.tagName === "TEXTAREA")) clientText = clientText.slice(1);
        const { textContent } = el;
        if (textContent !== clientText && textContent !== clientText.replace(/\r\n|\r/g, "\n")) {
          if (!isMismatchAllowed(el, 0)) {
            warn$1(`Hydration text content mismatch on`, el, `
  - rendered on server: ${textContent}
  - expected on client: ${clientText}`);
            logMismatchError();
          }
          el.textContent = vnode.children;
        }
      }
      if (props) {
        if (true) {
          const isCustomElement = el.tagName.includes("-");
          for (const key in props) {
            if (!(dirs && dirs.some((d) => d.dir.created)) && propHasMismatch(el, key, props[key], vnode, parentComponent)) logMismatchError();
            if (forcePatch && (key.endsWith("value") || key === "indeterminate") || isOn(key) && !isReservedProp(key) || key[0] === "." || isCustomElement && !isReservedProp(key)) patchProp2(el, key, null, props[key], void 0, parentComponent);
          }
        } else if (props.onClick) patchProp2(el, "onClick", null, props.onClick, void 0, parentComponent);
        else if (patchFlag & 4 && isReactive(props.style)) for (const key in props.style) props.style[key];
      }
      let vnodeHooks;
      if (vnodeHooks = props && props.onVnodeBeforeMount) invokeVNodeHook(vnodeHooks, parentComponent, vnode);
      if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      if ((vnodeHooks = props && props.onVnodeMounted) || dirs || needCallTransitionHooks) queueEffectWithSuspense(() => {
        vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, void 0, parentSuspense2);
    }
    return el.nextSibling;
  };
  const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense2, slotScopeIds, optimized) => {
    optimized = optimized || !!parentVNode.dynamicChildren;
    const children = parentVNode.children;
    const l = children.length;
    let hasWarned2 = false;
    for (let i = 0; i < l; i++) {
      const vnode = optimized ? children[i] : children[i] = normalizeVNode(children[i]);
      const isText = vnode.type === Text2;
      if (node) {
        if (isText && !optimized) {
          if (i + 1 < l && normalizeVNode(children[i + 1]).type === Text2) {
            insert2(createText(node.data.slice(vnode.children.length)), container, nextSibling(node));
            node.data = vnode.children;
          }
        }
        node = hydrateNode2(node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized);
      } else if (isText && !vnode.children) insert2(vnode.el = createText(""), container);
      else {
        if (!isMismatchAllowed(container, 1)) {
          if (!hasWarned2) {
            warn$1(`Hydration children mismatch on`, container, `
Server rendered element contains fewer child nodes than client vdom.`);
            hasWarned2 = true;
          }
          logMismatchError();
        }
        patch(null, vnode, container, null, parentComponent, parentSuspense2, getContainerType(container), slotScopeIds);
      }
    }
    return node;
  };
  const hydrateFragment = (node, vnode, parentComponent, parentSuspense2, slotScopeIds, optimized) => {
    const { slotScopeIds: fragmentSlotScopeIds } = vnode;
    if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    const container = parentNode2(node);
    const next2 = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense2, slotScopeIds, optimized);
    if (next2 && isComment(next2) && next2.data === "]") return nextSibling(vnode.anchor = next2);
    else {
      logMismatchError();
      insert2(vnode.anchor = createComment2(`]`), container, next2);
      return next2;
    }
  };
  const handleMismatch2 = (node, vnode, parentComponent, parentSuspense2, slotScopeIds, isFragment2) => {
    if (!isMismatchAllowed(node.parentElement, 1)) {
      warn$1(`Hydration node mismatch:
- rendered on server:`, node, node.nodeType === 3 ? `(text)` : isComment(node) && node.data === "[" ? `(start of fragment)` : ``, `
- expected on client:`, vnode.type);
      logMismatchError();
    }
    vnode.el = null;
    if (isFragment2) {
      const end = locateClosingAnchor(node);
      while (true) {
        const next3 = nextSibling(node);
        if (next3 && next3 !== end) remove3(next3);
        else break;
      }
    }
    const next2 = nextSibling(node);
    const container = parentNode2(node);
    remove3(node);
    patch(null, vnode, container, next2, parentComponent, parentSuspense2, getContainerType(container), slotScopeIds);
    if (parentComponent) {
      parentComponent.vnode.el = vnode.el;
      updateHOCHostEl(parentComponent, vnode.el);
    }
    return next2;
  };
  const locateClosingAnchor = (node, open = "[", close = "]") => {
    let match = 0;
    while (node) {
      node = nextSibling(node);
      if (node && isComment(node)) {
        if (node.data === open) match++;
        if (node.data === close) if (match === 0) return nextSibling(node);
        else match--;
      }
    }
    return node;
  };
  const replaceNode = (newNode, oldNode, parentComponent) => {
    const parentNode3 = oldNode.parentNode;
    if (parentNode3) parentNode3.replaceChild(newNode, oldNode);
    let parent = parentComponent;
    while (parent) {
      if (parent.vnode.el === oldNode) parent.vnode.el = parent.subTree.el = newNode;
      parent = parent.parent;
    }
  };
  return [hydrate2, hydrateNode2];
}
var isTemplateNode = (node) => {
  return node.nodeType === 1 && node.tagName === "TEMPLATE";
};
function propHasMismatch(el, key, clientValue, vnode, instance) {
  let mismatchType;
  let mismatchKey;
  let actual;
  let expected;
  if (key === "class") {
    if (el.$cls) {
      actual = el.$cls;
      delete el.$cls;
    } else actual = el.getAttribute("class");
    expected = normalizeClass(clientValue);
    if (!isSetEqual(toClassSet(actual || ""), toClassSet(expected))) {
      mismatchType = 2;
      mismatchKey = `class`;
    }
  } else if (key === "style") {
    actual = el.getAttribute("style") || "";
    expected = isString(clientValue) ? clientValue : stringifyStyle(normalizeStyle(clientValue));
    const actualMap = toStyleMap(actual);
    const expectedMap = toStyleMap(expected);
    if (vnode.dirs) {
      for (const { dir, value } of vnode.dirs) if (dir.name === "show" && !value) expectedMap.set("display", "none");
    }
    if (instance) resolveCssVars(instance, vnode, expectedMap);
    if (!isMapEqual(actualMap, expectedMap)) {
      mismatchType = 3;
      mismatchKey = "style";
    }
  } else if (isValidHtmlOrSvgAttribute(el, key)) {
    ({ actual, expected } = getAttributeMismatch(el, key, clientValue));
    if (actual !== expected) {
      mismatchType = 4;
      mismatchKey = key;
    }
  }
  return warnPropMismatch(el, mismatchKey, mismatchType, actual, expected);
}
function getAttributeMismatch(el, key, clientValue) {
  let actual;
  let expected;
  if (isBooleanAttr(key)) {
    actual = el.hasAttribute(key);
    expected = includeBooleanAttr(clientValue);
  } else if (clientValue == null) {
    actual = el.hasAttribute(key);
    expected = false;
  } else {
    if (el.hasAttribute(key)) actual = el.getAttribute(key);
    else if (key === "value" && el.tagName === "TEXTAREA") actual = el.value;
    else actual = false;
    expected = isRenderableAttrValue(clientValue) ? String(clientValue) : false;
  }
  return {
    actual,
    expected
  };
}
function isValidHtmlOrSvgAttribute(el, key) {
  return el instanceof SVGElement && isKnownSvgAttr(key) || el instanceof HTMLElement && (isBooleanAttr(key) || isKnownHtmlAttr(key));
}
function warnPropMismatch(el, mismatchKey, mismatchType, actual, expected) {
  if (mismatchType != null && !isMismatchAllowed(el, mismatchType)) {
    const format = (v) => v === false ? `(not rendered)` : `${mismatchKey}="${v}"`;
    warn$1(`Hydration ${MismatchTypeString[mismatchType]} mismatch on`, el, `
  - rendered on server: ${format(actual)}
  - expected on client: ${format(expected)}
  Note: this mismatch is check-only. The DOM will not be rectified in production due to performance overhead.
  You should fix the source of the mismatch.`);
    return true;
  }
  return false;
}
function toClassSet(str) {
  return new Set(str.trim().split(/\s+/));
}
function isSetEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const s of a) if (!b.has(s)) return false;
  return true;
}
function toStyleMap(str) {
  const styleMap = /* @__PURE__ */ new Map();
  for (const item of str.split(";")) {
    let [key, value] = item.split(":");
    key = key.trim();
    value = value && value.trim();
    if (key && value) styleMap.set(key, value);
  }
  return styleMap;
}
function isMapEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (value !== b.get(key)) return false;
  return true;
}
function resolveCssVars(instance, vnode, expectedMap) {
  const root = instance.subTree;
  if (instance.getCssVars && (vnode === root || root && root.type === Fragment && root.children.includes(vnode))) {
    const cssVars = instance.getCssVars();
    for (const key in cssVars) {
      const value = normalizeCssVarValue(cssVars[key]);
      expectedMap.set(`--${getEscapedCssVarName(key, false)}`, value);
    }
  }
  if (vnode === root && instance.parent) resolveCssVars(instance.parent, instance.vnode, expectedMap);
}
var allowMismatchAttr = "data-allow-mismatch";
var MismatchTypes = {
  "TEXT": 0,
  "0": "TEXT",
  "CHILDREN": 1,
  "1": "CHILDREN",
  "CLASS": 2,
  "2": "CLASS",
  "STYLE": 3,
  "3": "STYLE",
  "ATTRIBUTE": 4,
  "4": "ATTRIBUTE"
};
var MismatchTypeString = {
  [0]: "text",
  [1]: "children",
  [2]: "class",
  [3]: "style",
  [4]: "attribute"
};
function isMismatchAllowed(el, allowedType) {
  if (allowedType === 0 || allowedType === 1) while (el && !el.hasAttribute(allowMismatchAttr)) el = el.parentElement;
  const allowedAttr = el && el.getAttribute(allowMismatchAttr);
  if (allowedAttr == null) return false;
  else if (allowedAttr === "") return true;
  else {
    const list = allowedAttr.split(",");
    if (allowedType === 0 && list.includes("children")) return true;
    return list.includes(MismatchTypeString[allowedType]);
  }
}
var requestIdleCallback;
var cancelIdleCallback;
function ensureIdleCallbacks() {
  if (!requestIdleCallback) {
    const g = getGlobalThis();
    requestIdleCallback = g.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    cancelIdleCallback = g.cancelIdleCallback || ((id) => clearTimeout(id));
  }
}
var hydrateOnIdle = (timeout = 1e4) => (hydrate2) => {
  ensureIdleCallbacks();
  const id = requestIdleCallback(hydrate2, { timeout });
  return () => cancelIdleCallback(id);
};
function elementIsVisibleInViewport(el) {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return (top > 0 && top < innerHeight || bottom > 0 && bottom < innerHeight) && (left > 0 && left < innerWidth || right > 0 && right < innerWidth);
}
var hydrateOnVisible = (opts) => (hydrate2, forEach) => {
  const ob = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      ob.disconnect();
      hydrate2();
      break;
    }
  }, opts);
  forEach((el) => {
    if (!(el instanceof Element)) return;
    if (elementIsVisibleInViewport(el)) {
      hydrate2();
      ob.disconnect();
      return false;
    }
    ob.observe(el);
  });
  return () => ob.disconnect();
};
var hydrateOnMediaQuery = (query) => (hydrate2) => {
  if (query) {
    const mql = matchMedia(query);
    if (mql.matches) hydrate2();
    else {
      mql.addEventListener("change", hydrate2, { once: true });
      return () => mql.removeEventListener("change", hydrate2);
    }
  }
};
var hydrateOnInteraction = (interactions = []) => (hydrate2, forEach) => {
  if (isString(interactions)) interactions = [interactions];
  let hasHydrated = false;
  const doHydrate = (e) => {
    if (!hasHydrated) {
      hasHydrated = true;
      teardown();
      hydrate2();
      if (!(`$evt${e.type}` in e.target)) e.target.dispatchEvent(new e.constructor(e.type, e));
    }
  };
  const teardown = () => {
    forEach((el) => {
      for (const i of interactions) el.removeEventListener(i, doHydrate);
    });
  };
  forEach((el) => {
    for (const i of interactions) el.addEventListener(i, doHydrate, { once: true });
  });
  return teardown;
};
function forEachElement(node, cb) {
  if (isComment(node) && node.data === "[") {
    let depth = 1;
    let next2 = node.nextSibling;
    while (next2) {
      if (next2.nodeType === 1) {
        if (cb(next2) === false) break;
      } else if (isComment(next2)) {
        if (next2.data === "]") {
          if (--depth === 0) break;
        } else if (next2.data === "[") depth++;
      }
      next2 = next2.nextSibling;
    }
  } else cb(node);
}
var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
function defineAsyncComponent(source) {
  const { load, getResolvedComp, setPendingRequest, source: { loadingComponent, errorComponent, delay, hydrate: hydrateStrategy, timeout, suspensible = true } } = createAsyncComponentContext(source);
  return defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: load,
    __asyncHydrate(el, instance, hydrate2) {
      performAsyncHydrate(el, instance, hydrate2, getResolvedComp, load, hydrateStrategy);
    },
    get __asyncResolved() {
      return getResolvedComp();
    },
    setup() {
      const instance = currentInstance;
      markAsyncBoundary(instance);
      let resolvedComp = getResolvedComp();
      if (resolvedComp) return () => createInnerComp(resolvedComp, instance);
      const onError = (err) => {
        setPendingRequest(null);
        handleError(err, instance, 13, !errorComponent);
      };
      if (suspensible && instance.suspense || isInSSRComponentSetup) return load().then((comp) => {
        return () => createInnerComp(comp, instance);
      }).catch((err) => {
        onError(err);
        return () => errorComponent ? createVNode(errorComponent, { error: err }) : null;
      });
      const { loaded, error, delayed } = useAsyncComponentState(delay, timeout, onError);
      load().then(() => {
        loaded.value = true;
        if (instance.parent && instance.parent.vnode && isKeepAlive(instance.parent.vnode)) instance.parent.update();
      }).catch((err) => {
        onError(err);
        error.value = err;
      });
      return () => {
        resolvedComp = getResolvedComp();
        if (loaded.value && resolvedComp) return createInnerComp(resolvedComp, instance);
        else if (error.value && errorComponent) return createVNode(errorComponent, { error: error.value });
        else if (loadingComponent && !delayed.value) return createInnerComp(loadingComponent, instance);
      };
    }
  });
}
function createInnerComp(comp, parent) {
  const { ref: ref2, props, children, ce } = parent.vnode;
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref2;
  vnode.ce = ce;
  delete parent.vnode.ce;
  return vnode;
}
function createAsyncComponentContext(source) {
  if (isFunction(source)) source = { loader: source };
  const { loader, onError: userOnError } = source;
  let pendingRequest = null;
  let resolvedComp;
  let retries = 0;
  const retry = () => {
    retries++;
    pendingRequest = null;
    return load();
  };
  const load = () => {
    let thisRequest;
    return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
      err = err instanceof Error ? err : new Error(String(err));
      if (userOnError) return new Promise((resolve2, reject) => {
        const userRetry = () => resolve2(retry());
        const userFail = () => reject(err);
        userOnError(err, userRetry, userFail, retries + 1);
      });
      else throw err;
    }).then((comp) => {
      if (thisRequest !== pendingRequest && pendingRequest) return pendingRequest;
      if (!comp) warn$1("Async component loader resolved to undefined. If you are using retry(), make sure to return its return value.");
      if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) comp = comp.default;
      if (comp && !isObject(comp) && !isFunction(comp)) throw new Error(`Invalid async component load result: ${comp}`);
      resolvedComp = comp;
      return comp;
    }));
  };
  return {
    load,
    source,
    getResolvedComp: () => resolvedComp,
    setPendingRequest: (request) => pendingRequest = request
  };
}
var useAsyncComponentState = (delay, timeout, onError) => {
  const loaded = ref(false);
  const error = ref();
  const delayed = ref(!!delay);
  if (delay) setTimeout(() => {
    delayed.value = false;
  }, delay);
  if (timeout != null) setTimeout(() => {
    if (!loaded.value && !error.value) {
      const err = new Error(`Async component timed out after ${timeout}ms.`);
      onError(err);
      error.value = err;
    }
  }, timeout);
  return {
    loaded,
    error,
    delayed
  };
};
function performAsyncHydrate(el, instance, hydrate2, getResolvedComp, load, hydrateStrategy) {
  let patched = false;
  (instance.bu || (instance.bu = [])).push(() => patched = true);
  const performHydrate = () => {
    if (patched) {
      if (true) {
        const resolvedComp = getResolvedComp();
        warn$1(`Skipping lazy hydration for component '${getComponentName(resolvedComp) || resolvedComp.__file}': it was updated before lazy hydration performed.`);
      }
      return;
    }
    hydrate2();
  };
  const doHydrate = hydrateStrategy ? () => {
    const teardown = hydrateStrategy(performHydrate, (cb) => forEachElement(el, cb));
    if (teardown) (instance.bum || (instance.bum = [])).push(teardown);
  } : performHydrate;
  if (getResolvedComp()) doHydrate();
  else load().then(() => !instance.isUnmounted && doHydrate());
}
var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
var KeepAliveImpl = {
  name: `KeepAlive`,
  __isKeepAlive: true,
  props: {
    include: [
      String,
      RegExp,
      Array
    ],
    exclude: [
      String,
      RegExp,
      Array
    ],
    max: [String, Number]
  },
  setup(props, { slots }) {
    const keepAliveInstance = getCurrentInstance();
    const sharedContext = keepAliveInstance.ctx;
    if (!sharedContext.renderer) return () => {
      const children = slots.default && slots.default();
      return children && children.length === 1 ? children[0] : children;
    };
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    let current = null;
    if (true) keepAliveInstance.__v_cache = cache;
    const parentSuspense2 = keepAliveInstance.suspense;
    const { renderer: renderer2 } = sharedContext;
    const { um: _unmount, o: { createElement: createElement2 } } = renderer2;
    const storageContainer = createElement2("div");
    sharedContext.getStorageContainer = () => storageContainer;
    sharedContext.getCachedComponent = (vnode) => {
      const key = vnode.key == null ? vnode.type : vnode.key;
      return cache.get(key);
    };
    sharedContext.activate = (vnode, container, anchor, namespace, optimized) => {
      activate(vnode, container, anchor, renderer2, keepAliveInstance, parentSuspense2, namespace, optimized);
    };
    sharedContext.deactivate = (vnode) => {
      deactivate(vnode, storageContainer, renderer2, keepAliveInstance, parentSuspense2);
    };
    function unmount(vnode) {
      resetShapeFlag(vnode);
      _unmount(vnode, keepAliveInstance, parentSuspense2, true);
    }
    function pruneCache(filter) {
      cache.forEach((vnode, key) => {
        const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : vnode.type);
        if (name && !filter(name)) pruneCacheEntry(key);
      });
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key);
      if (cached && (!current || !isSameVNodeType(cached, current))) unmount(cached);
      else if (current) resetShapeFlag(current);
      cache.delete(key);
      keys.delete(key);
    }
    watch2(() => [props.include, props.exclude], ([include, exclude]) => {
      include && pruneCache((name) => matches(include, name));
      exclude && pruneCache((name) => !matches(exclude, name));
    }, {
      flush: "post",
      deep: true
    });
    let pendingCacheKey = null;
    const cacheSubtree = () => {
      if (pendingCacheKey != null) if (isSuspense(keepAliveInstance.subTree.type)) queuePostRenderEffect(() => {
        cache.set(pendingCacheKey, getInnerChild(keepAliveInstance.subTree));
      }, void 0, keepAliveInstance.subTree.suspense);
      else cache.set(pendingCacheKey, getInnerChild(keepAliveInstance.subTree));
    };
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    onBeforeUnmount(() => {
      cache.forEach((cached) => {
        const { subTree, suspense } = keepAliveInstance;
        const vnode = getInnerChild(subTree);
        if (cached.type === vnode.type && cached.key === vnode.key) {
          resetShapeFlag(vnode);
          const da = vnode.component.da;
          da && queuePostRenderEffect(da, void 0, suspense);
          return;
        }
        unmount(cached);
      });
    });
    return () => {
      pendingCacheKey = null;
      if (!slots.default) return current = null;
      const children = slots.default();
      const rawVNode = children[0];
      if (children.length > 1) {
        if (true) warn$1(`KeepAlive should contain exactly one component child.`);
        current = null;
        return children;
      } else if (!isVNode(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
        current = null;
        return rawVNode;
      }
      let vnode = getInnerChild(rawVNode);
      if (vnode.type === Comment2) {
        current = null;
        return vnode;
      }
      const comp = vnode.type;
      const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
      const { include, exclude, max } = props;
      if (include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name)) {
        vnode.shapeFlag &= -257;
        current = vnode;
        return rawVNode;
      }
      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);
      if (vnode.el) {
        vnode = cloneVNode(vnode);
        if (rawVNode.shapeFlag & 128) rawVNode.ssContent = vnode;
      }
      pendingCacheKey = key;
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;
        if (vnode.transition) setTransitionHooks(vnode, vnode.transition);
        vnode.shapeFlag |= 512;
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) pruneCacheEntry(keys.values().next().value);
      }
      vnode.shapeFlag |= 256;
      current = vnode;
      return isSuspense(rawVNode.type) ? rawVNode : vnode;
    };
  }
};
var KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
  if (isArray(pattern)) return pattern.some((p3) => matches(p3, name));
  else if (isString(pattern)) return pattern.split(",").includes(name);
  else if (isRegExp(pattern)) {
    pattern.lastIndex = 0;
    return pattern.test(name);
  }
  return false;
}
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = getCurrentGenericInstance()) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) return;
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      let parent = current.parent;
      if (isKeepAlive(parent.vapor ? parent : parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(type, hook, keepAliveRoot, true);
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function resetShapeFlag(vnode) {
  vnode.shapeFlag &= -257;
  vnode.shapeFlag &= -513;
}
function getInnerChild(vnode) {
  return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
function activate(vnode, container, anchor, { p: patch, m: move2 }, parentComponent, parentSuspense2, namespace, optimized) {
  const instance = vnode.component;
  move2(vnode, container, anchor, 0, parentComponent, parentSuspense2);
  patch(instance.vnode, vnode, container, anchor, instance, parentSuspense2, namespace, vnode.slotScopeIds, optimized);
  queuePostRenderEffect(() => {
    instance.isDeactivated = false;
    if (instance.a) invokeArrayFns(instance.a);
    const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
    if (vnodeHook) invokeVNodeHook(vnodeHook, instance.parent, vnode);
  }, void 0, parentSuspense2);
  if (true) devtoolsComponentAdded(instance);
}
function deactivate(vnode, container, { m: move2 }, parentComponent, parentSuspense2) {
  const instance = vnode.component;
  invalidateMount(instance.m);
  invalidateMount(instance.a);
  move2(vnode, container, null, 1, parentComponent, parentSuspense2);
  queuePostRenderEffect(() => {
    if (instance.da) invokeArrayFns(instance.da);
    const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
    if (vnodeHook) invokeVNodeHook(vnodeHook, instance.parent, vnode);
    instance.isDeactivated = true;
  }, void 0, parentSuspense2);
  if (true) devtoolsComponentAdded(instance);
}
function injectHook(type, hook, target = currentInstance, prepend2 = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      const prevSub = setActiveSub();
      const prev = setCurrentInstance(target);
      try {
        return callWithAsyncErrorHandling(hook, target, type, args);
      } finally {
        setCurrentInstance(...prev);
        setActiveSub(prevSub);
      }
    });
    if (prepend2) hooks.unshift(wrappedHook);
    else hooks.push(wrappedHook);
    return wrappedHook;
  } else if (true) warn$1(`${toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""))} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`);
}
var createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
};
var onBeforeMount = createHook("bm");
var onMounted = createHook("m");
var onBeforeUpdate = createHook("bu");
var onUpdated = createHook("u");
var onBeforeUnmount = createHook("bum");
var onUnmounted = createHook("um");
var onServerPrefetch = createHook("sp");
var onRenderTriggered = createHook("rtg");
var onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
var COMPONENTS = "components";
var DIRECTIVES = "directives";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
var NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString(component)) return resolveAsset(COMPONENTS, component, false) || component;
  else return component || NULL_DYNAMIC_COMPONENT;
}
function resolveDirective(name) {
  return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(Component, false);
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) return Component;
    }
    const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
    if (!res && maybeSelfReference) return Component;
    if (warnMissing && !res) {
      const extra = type === COMPONENTS ? "\nIf this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement." : ``;
      warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
    }
    return res;
  } else if (true) warn$1(`resolve${capitalize(type.slice(0, -1))} can only be used in render() or setup().`);
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  const sourceIsArray = isArray(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !isShallow(source);
      isReadonlySource = isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
  } else if (typeof source === "number") {
    if (!Number.isInteger(source)) warn$1(`The v-for range expect an integer value but got ${source}.`);
    ret = new Array(source);
    for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
  } else if (isObject(source)) if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
  else {
    const keys = Object.keys(source);
    ret = new Array(keys.length);
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      ret[i] = renderItem(source[key], key, i, cached && cached[i]);
    }
  }
  else ret = [];
  if (cache) cache[index] = ret;
  return ret;
}
function createSlots(slots, dynamicSlots) {
  for (let i = 0; i < dynamicSlots.length; i++) {
    const slot = dynamicSlots[i];
    if (isArray(slot)) for (let j = 0; j < slot.length; j++) slots[slot[j].name] = slot[j].fn;
    else if (slot) slots[slot.name] = slot.key ? (...args) => {
      const res = slot.fn(...args);
      if (res) res.key = slot.key;
      return res;
    } : slot.fn;
  }
  return slots;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  let slot = slots[name];
  const vaporSlot = slot && (slot.__vs || (slot.__vapor ? slot : null));
  if (vaporSlot) {
    const ret = (openBlock(), createBlock(VaporSlot, props));
    ret.vs = {
      slot: vaporSlot,
      fallback
    };
    return ret;
  }
  if (currentRenderingInstance && (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce)) {
    const hasProps = Object.keys(props).length > 0;
    if (name !== "default") props.name = name;
    return openBlock(), createBlock(Fragment, null, [createVNode("slot", props, fallback && fallback())], hasProps ? -2 : 64);
  }
  if (slot && slot.length > 1) {
    warn$1("SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template.");
    slot = () => [];
  }
  if (slot && slot._c) slot._d = false;
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  ensureVaporSlotFallback(validSlotContent, fallback);
  const slotKey = props.key || validSlotContent && validSlotContent.key;
  const rendered = createBlock(Fragment, { key: (slotKey && !isSymbol(slotKey) ? slotKey : `_${name}`) + (!validSlotContent && fallback ? "_fb" : "") }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
  if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [rendered.scopeId + "-s"];
  if (slot && slot._c) slot._d = true;
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child2) => {
    if (!isVNode(child2)) return true;
    if (child2.type === Comment2) return false;
    if (child2.type === Fragment && !ensureValidVNode(child2.children)) return false;
    return true;
  }) ? vnodes : null;
}
function ensureVaporSlotFallback(vnodes, fallback) {
  let vaporSlot;
  if (vnodes && vnodes.length === 1 && isVNode(vnodes[0]) && (vaporSlot = vnodes[0].vs)) {
    if (!vaporSlot.fallback && fallback) vaporSlot.fallback = fallback;
  }
}
function toHandlers(obj, preserveCaseIfNecessary) {
  const ret = {};
  if (!isObject(obj)) {
    warn$1(`v-on with no argument expects an object value.`);
    return ret;
  }
  for (const key in obj) ret[preserveCaseIfNecessary && /[A-Z]/.test(key) ? `on:${key}` : toHandlerKey(key)] = obj[key];
  return ret;
}
var getPublicInstance = (i) => {
  if (!i || i.vapor) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
var publicPropertiesMap;
var getPublicPropertiesMap = () => {
  if (!publicPropertiesMap) publicPropertiesMap = extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => true ? shallowReadonly(i.props) : i.props,
    $attrs: (i) => true ? shallowReadonly(i.attrs) : i.attrs,
    $slots: (i) => true ? shallowReadonly(i.slots) : i.slots,
    $refs: (i) => true ? shallowReadonly(i.refs) : i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => __VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type,
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => __VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP
  });
  return publicPropertiesMap;
};
var isReservedPrefix = (key) => key === "_" || key === "$";
var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
var PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") return true;
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key === "__isVue") return true;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) switch (n) {
        case 1:
          return setupState[key];
        case 2:
          return data[key];
        case 4:
          return ctx[key];
        case 3:
          return props[key];
      }
      else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (!__VUE_OPTIONS_API__ || shouldCacheAccess) accessCache[key] = 0;
    }
    const publicGetter = getPublicPropertiesMap()[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
        markAttrsAccessed();
      } else if (key === "$slots") track(instance, "get", key);
      return publicGetter(instance);
    } else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
    else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) return globalProperties[key];
    else if (currentRenderingInstance && (!isString(key) || key.indexOf("__v") !== 0)) {
      if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) warn$1(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`);
      else if (instance === currentRenderingInstance) warn$1(`Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`);
    }
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (setupState.__isScriptSetup && hasOwn(setupState, key)) {
      warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
      return false;
    } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      warn$1(`Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`);
      return false;
    } else if (key in instance.appContext.config.globalProperties) Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: true,
      value
    });
    else ctx[key] = value;
    return true;
  },
  has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
    let cssModules;
    return !!(accessCache[key] || __VUE_OPTIONS_API__ && data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(getPublicPropertiesMap(), key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) target._.accessCache[key] = 0;
    else if (hasOwn(descriptor, "value")) this.set(target, key, descriptor.value, null);
    return Reflect.defineProperty(target, key, descriptor);
  }
};
if (true) PublicInstanceProxyHandlers.ownKeys = (target) => {
  warn$1("Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.");
  return Reflect.ownKeys(target);
};
var RuntimeCompiledPublicInstanceProxyHandlers = extend({}, PublicInstanceProxyHandlers, {
  get(target, key) {
    if (key === Symbol.unscopables) return;
    return PublicInstanceProxyHandlers.get(target, key, target);
  },
  has(_, key) {
    const has = key[0] !== "_" && !isGloballyAllowed(key);
    if (!has && PublicInstanceProxyHandlers.has(_, key)) warn$1(`Property ${JSON.stringify(key)} should not start with _ which is a reserved prefix for Vue internals.`);
    return has;
  }
});
function createDevRenderContext(instance) {
  const target = {};
  Object.defineProperty(target, `_`, {
    configurable: true,
    enumerable: false,
    get: () => instance
  });
  Object.keys(getPublicPropertiesMap()).forEach((key) => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => getPublicPropertiesMap()[key](instance),
      set: NOOP
    });
  });
  return target;
}
function exposePropsOnRenderContext(instance) {
  const { ctx, propsOptions: [propsOptions] } = instance;
  if (propsOptions) Object.keys(propsOptions).forEach((key) => {
    Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: true,
      get: () => instance.props[key],
      set: NOOP
    });
  });
}
function exposeSetupStateOnRenderContext(instance) {
  const { ctx, setupState } = instance;
  Object.keys(toRaw(setupState)).forEach((key) => {
    if (!setupState.__isScriptSetup) {
      if (isReservedPrefix(key[0])) {
        warn$1(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
        return;
      }
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => setupState[key],
        set: NOOP
      });
    }
  });
}
var warnRuntimeUsage = (method) => warn$1(`${method}() is a compiler-hint helper that is only usable inside <script setup> of a single file component. Its arguments should be compiled away and passing it at runtime has no effect.`);
function defineProps() {
  if (true) warnRuntimeUsage(`defineProps`);
  return null;
}
function defineEmits() {
  if (true) warnRuntimeUsage(`defineEmits`);
  return null;
}
function defineExpose(exposed) {
  if (true) warnRuntimeUsage(`defineExpose`);
}
function defineOptions(options) {
  if (true) warnRuntimeUsage(`defineOptions`);
}
function defineSlots() {
  if (true) warnRuntimeUsage(`defineSlots`);
  return null;
}
function defineModel() {
  if (true) warnRuntimeUsage("defineModel");
}
function withDefaults(props, defaults) {
  if (true) warnRuntimeUsage(`withDefaults`);
  return null;
}
function useSlots() {
  return getContext("useSlots").slots;
}
function useAttrs() {
  return getContext("useAttrs").attrs;
}
function getContext(calledFunctionName) {
  const i = getCurrentGenericInstance();
  if (!i) warn$1(`${calledFunctionName}() called without active instance.`);
  if (i.vapor) return i;
  else {
    const ii = i;
    return ii.setupContext || (ii.setupContext = createSetupContext(ii));
  }
}
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce((normalized, p3) => (normalized[p3] = null, normalized), {}) : props;
}
function mergeDefaults(raw, defaults) {
  const props = normalizePropsOrEmits(raw);
  for (const key in defaults) {
    if (key.startsWith("__skip")) continue;
    let opt = props[key];
    if (opt) if (isArray(opt) || isFunction(opt)) opt = props[key] = {
      type: opt,
      default: defaults[key]
    };
    else opt.default = defaults[key];
    else if (opt === null) opt = props[key] = { default: defaults[key] };
    else if (true) warn$1(`props default key "${key}" has no corresponding declaration.`);
    if (opt && defaults[`__skip_${key}`]) opt.skipFactory = true;
  }
  return props;
}
function mergeModels(a, b) {
  if (!a || !b) return a || b;
  if (isArray(a) && isArray(b)) return a.concat(b);
  return extend({}, normalizePropsOrEmits(a), normalizePropsOrEmits(b));
}
function createPropsRestProxy(props, excludedKeys) {
  const ret = {};
  for (const key in props) if (!excludedKeys.includes(key)) Object.defineProperty(ret, key, {
    enumerable: true,
    get: () => props[key]
  });
  return ret;
}
function withAsyncContext(getAwaitable) {
  const ctx = getCurrentGenericInstance();
  if (!ctx) warn$1("withAsyncContext called without active current instance. This is likely a bug.");
  let awaitable = getAwaitable();
  setCurrentInstance(null, void 0);
  const cleanup2 = () => setCurrentInstance(null, void 0);
  if (isPromise(awaitable)) awaitable = awaitable.catch((e) => {
    setCurrentInstance(ctx);
    Promise.resolve().then(() => Promise.resolve().then(cleanup2));
    throw e;
  });
  return [awaitable, () => {
    setCurrentInstance(ctx);
    Promise.resolve().then(cleanup2);
  }];
}
function createDuplicateChecker() {
  const cache = /* @__PURE__ */ Object.create(null);
  return (type, key) => {
    if (cache[key]) warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
    else cache[key] = type;
  };
}
var shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) callHook(options.beforeCreate, instance, "bc");
  const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render: render2, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose: expose2, inheritAttrs, components, directives, filters } = options;
  const checkDuplicateProperties = true ? createDuplicateChecker() : null;
  if (true) {
    const [propsOptions] = instance.propsOptions;
    if (propsOptions) for (const key in propsOptions) checkDuplicateProperties("Props", key);
  }
  if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  if (methods) for (const key in methods) {
    const methodHandler = methods[key];
    if (isFunction(methodHandler)) {
      if (true) Object.defineProperty(ctx, key, {
        value: methodHandler.bind(publicThis),
        configurable: true,
        enumerable: true,
        writable: true
      });
      else ctx[key] = methodHandler.bind(publicThis);
      if (true) checkDuplicateProperties("Methods", key);
    } else if (true) warn$1(`Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`);
  }
  if (dataOptions) {
    if (!isFunction(dataOptions)) warn$1("The data option must be a function. Plain object usage is no longer supported.");
    const data = dataOptions.call(publicThis, publicThis);
    if (isPromise(data)) warn$1("data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.");
    if (!isObject(data)) warn$1(`data() should return an object.`);
    else {
      instance.data = reactive(data);
      if (true) for (const key in data) {
        checkDuplicateProperties("Data", key);
        if (!isReservedPrefix(key[0])) Object.defineProperty(ctx, key, {
          configurable: true,
          enumerable: true,
          get: () => data[key],
          set: NOOP
        });
      }
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) for (const key in computedOptions) {
    const opt = computedOptions[key];
    const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
    if (get === NOOP) warn$1(`Computed property "${key}" has no getter.`);
    const c = computed2({
      get,
      set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : true ? () => {
        warn$1(`Write operation failed: computed property "${key}" is readonly.`);
      } : NOOP
    });
    Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: true,
      get: () => c.value,
      set: (v) => c.value = v
    });
    if (true) checkDuplicateProperties("Computed", key);
  }
  if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) callHook(created, instance, "c");
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
    else if (hook) register(hook.bind(publicThis));
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose2)) {
    if (expose2.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose2.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) instance.exposed = {};
  }
  if (render2 && instance.render === NOOP) instance.render = render2;
  if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) markAsyncBoundary(instance);
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
    else injected = inject(opt.from || key);
    else injected = inject(opt);
    if (isRef2(injected)) Object.defineProperty(ctx, key, {
      enumerable: true,
      configurable: true,
      get: () => injected.value,
      set: (v) => injected.value = v
    });
    else ctx[key] = injected;
    if (true) checkDuplicateProperties("Inject", key);
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) watch2(getter, handler);
    else if (true) warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
  } else if (isFunction(raw)) watch2(getter, raw.bind(publicThis));
  else if (isObject(raw)) if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
  else {
    const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
    if (isFunction(handler)) watch2(getter, handler, raw);
    else if (true) warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
  }
  else if (true) warn$1(`Invalid watch option: "${key}"`, raw);
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) resolved = cached;
  else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
  else {
    resolved = {};
    if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) cache.set(base, resolved);
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
  if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
  for (const key in from) if (asMixin && key === "expose") warn$1('"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.');
  else {
    const strat = internalOptionMergeStrats[key] || strats && strats[key];
    to[key] = strat ? strat(to[key], from[key]) : from[key];
  }
  return to;
}
var internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  watch: mergeWatchOptions,
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) return to;
  if (!to) return from;
  return function mergedDataFn() {
    return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) return [.../* @__PURE__ */ new Set([...to, ...from])];
    return extend(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from !== null && from !== void 0 ? from : {}));
  } else return from;
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
var uid$1 = 0;
function createAppAPI(mount, unmount, getPublicInstance2, render2) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) rootComponent = extend({}, rootComponent);
    if (rootProps != null && !isObject(rootProps)) {
      warn$1(`root props passed to app.mount() must be an object.`);
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
        if (true) warn$1(`app.config cannot be replaced. Modify individual options instead.`);
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) warn$1(`Plugin has already been applied to target app.`);
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else if (true) warn$1('A plugin must either be a function or an object with an "install" function.');
        return app;
      },
      mixin(mixin) {
        if (__VUE_OPTIONS_API__) {
          if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
          else if (true) warn$1("Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : ""));
        } else if (true) warn$1("Mixins are only available in builds supporting Options API");
        return app;
      },
      component(name, component) {
        if (true) validateComponentName(name, context.config);
        if (!component) return context.components[name];
        if (context.components[name]) warn$1(`Component "${name}" has already been registered in target app.`);
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (true) validateDirectiveName(name);
        if (!directive) return context.directives[name];
        if (context.directives[name]) warn$1(`Directive "${name}" has already been registered in target app.`);
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          if (rootContainer.__vue_app__) warn$1("There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first.");
          const instance = mount(app, rootContainer, isHydrate, namespace);
          if (true) {
            app._instance = instance;
            devtoolsInitApp(app, version);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getPublicInstance2(instance);
        } else if (true) warn$1("App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`");
      },
      onUnmount(cleanupFn) {
        if (typeof cleanupFn !== "function") warn$1(`Expected function as first argument to app.onUnmount(), but got ${typeof cleanupFn}`);
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
          unmount(app);
          if (true) {
            app._instance = null;
            devtoolsUnmountApp(app);
          }
          delete app._container.__vue_app__;
        } else if (true) warn$1(`Cannot unmount an app that is not mounted.`);
      },
      provide(key, value) {
        if (key in context.provides) if (hasOwn(context.provides, key)) warn$1(`App already provides property with key "${String(key)}". It will be overwritten with the new value.`);
        else warn$1(`App already provides property with key "${String(key)}" inherited from its parent element. It will be overwritten with the new value.`);
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
var currentApp = null;
function useModel(props, name, options = EMPTY_OBJ) {
  const i = getCurrentGenericInstance();
  if (!i) {
    warn$1(`useModel() called without active instance.`);
    return ref();
  }
  const camelizedName = camelize(name);
  if (!i.propsOptions[0][camelizedName]) {
    warn$1(`useModel() called with prop "${name}" which is not declared.`);
    return ref();
  }
  const hyphenatedName = hyphenate(name);
  const modifiers = getModelModifiers(props, camelizedName, defaultPropGetter);
  const res = customRef((track2, trigger2) => {
    let localValue;
    let prevSetValue = EMPTY_OBJ;
    let prevEmittedValue;
    watchSyncEffect(() => {
      const propValue = props[camelizedName];
      if (hasChanged(localValue, propValue)) {
        localValue = propValue;
        trigger2();
      }
    });
    return {
      get() {
        track2();
        return options.get ? options.get(localValue) : localValue;
      },
      set(value) {
        const emittedValue = options.set ? options.set(value) : value;
        if (!hasChanged(emittedValue, localValue) && !(prevSetValue !== EMPTY_OBJ && hasChanged(value, prevSetValue))) return;
        let rawPropKeys;
        let parentPassedModelValue = false;
        let parentPassedModelUpdater = false;
        if (i.rawKeys) rawPropKeys = i.rawKeys();
        else {
          const rawProps = i.vnode.props;
          rawPropKeys = rawProps && Object.keys(rawProps);
        }
        if (rawPropKeys) {
          for (const key of rawPropKeys) if (key === name || key === camelizedName || key === hyphenatedName) parentPassedModelValue = true;
          else if (key === `onUpdate:${name}` || key === `onUpdate:${camelizedName}` || key === `onUpdate:${hyphenatedName}`) parentPassedModelUpdater = true;
        }
        if (!parentPassedModelValue || !parentPassedModelUpdater) {
          localValue = value;
          trigger2();
        }
        i.emit(`update:${name}`, emittedValue);
        if (hasChanged(value, emittedValue) && hasChanged(value, prevSetValue) && !hasChanged(emittedValue, prevEmittedValue)) trigger2();
        prevSetValue = value;
        prevEmittedValue = emittedValue;
      }
    };
  });
  res[Symbol.iterator] = () => {
    let i2 = 0;
    return { next() {
      if (i2 < 2) return {
        value: i2++ ? modifiers || EMPTY_OBJ : res,
        done: false
      };
      else return { done: true };
    } };
  };
  return res;
}
var getModelModifiers = (props, modelName, getter) => {
  return getter(props, getModifierPropName(modelName)) || getter(props, `${camelize(modelName)}Modifiers`) || getter(props, `${hyphenate(modelName)}Modifiers`);
};
function emit(instance, event, ...rawArgs) {
  return baseEmit(instance, instance.vnode.props || EMPTY_OBJ, defaultPropGetter, event, ...rawArgs);
}
function baseEmit(instance, props, getter, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  if (true) {
    const { emitsOptions, propsOptions } = instance;
    if (emitsOptions) if (!(event in emitsOptions) && true) {
      if (!propsOptions || !propsOptions[0] || !(toHandlerKey(camelize(event)) in propsOptions[0])) warn$1(`Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`);
    } else {
      const validator = emitsOptions[event];
      if (isFunction(validator)) {
        if (!validator(...rawArgs)) warn$1(`Invalid event arguments: event validation failed for event "${event}".`);
      }
    }
  }
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7), getter);
  if (modifiers) {
    if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    if (modifiers.number) args = rawArgs.map(looseToNumber);
  }
  if (true) devtoolsComponentEmit(instance, event, args);
  if (true) {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && getter(props, toHandlerKey(lowerCaseEvent))) warn$1(`Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(event)}" instead of "${event}".`);
  }
  let handlerName;
  let handler = getter(props, handlerName = toHandlerKey(event)) || getter(props, handlerName = toHandlerKey(camelize(event)));
  if (!handler && isModelListener2) handler = getter(props, handlerName = toHandlerKey(hyphenate(event)));
  if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
  const onceHandler = getter(props, handlerName + `Once`);
  if (onceHandler) {
    if (!instance.emitted) instance.emitted = {};
    else if (instance.emitted[handlerName]) return;
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(onceHandler, instance, 6, args);
  }
}
function defaultPropGetter(props, key) {
  return props[key];
}
var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) return cached;
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
    if (comp.extends) extendEmits(comp.extends);
    if (comp.mixins) comp.mixins.forEach(extendEmits);
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) cache.set(comp, null);
    return null;
  }
  if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
  else extend(normalized, raw);
  if (isObject(comp)) cache.set(comp, normalized);
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) return false;
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
var accessedAttrs = false;
function markAttrsAccessed() {
  accessedAttrs = true;
}
function renderComponentRoot(instance) {
  const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit: emit3, render: render2, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  if (true) accessedAttrs = false;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = setupState.__isScriptSetup ? new Proxy(proxyToUse, { get(target, key, receiver) {
        warn$1(`Property '${String(key)}' was accessed via 'this'. Avoid using 'this' in templates.`);
        return Reflect.get(target, key, receiver);
      } }) : proxyToUse;
      result = normalizeVNode(render2.call(thisProxy, proxyToUse, renderCache, true ? shallowReadonly(props) : props, setupState, data, ctx));
      fallthroughAttrs = attrs;
    } else {
      const render3 = Component;
      if (attrs === props) markAttrsAccessed();
      result = normalizeVNode(render3.length > 1 ? render3(true ? shallowReadonly(props) : props, true ? {
        get attrs() {
          markAttrsAccessed();
          return shallowReadonly(attrs);
        },
        slots,
        emit: emit3
      } : {
        attrs,
        slots,
        emit: emit3
      }) : render3(true ? shallowReadonly(props) : props, null));
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment2);
  }
  let root = result;
  let setRoot = void 0;
  if (result.patchFlag > 0 && result.patchFlag & 2048) [root, setRoot] = getChildRoot(result);
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & 7) {
        if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
        root = cloneVNode(root, fallthroughAttrs, false, true);
      } else if (!accessedAttrs && root.type !== Comment2) warnExtraneousAttributes(attrs);
    }
  }
  if (vnode.dirs) {
    if (!isElementRoot(root)) warn$1("Runtime directive used on component with non-element root node. The directives will not function as intended.");
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    if (!isElementRoot(root)) warn$1("Component inside <Transition> renders non-element root node that cannot be animated.");
    setTransitionHooks(root, vnode.transition);
  }
  if (setRoot) setRoot(root);
  else result = root;
  setCurrentRenderingInstance(prev);
  return result;
}
var getChildRoot = (vnode) => {
  const rawChildren = vnode.children;
  const dynamicChildren = vnode.dynamicChildren;
  const childRoot = filterSingleRoot(rawChildren, false);
  if (!childRoot) return [vnode, void 0];
  else if (childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) return getChildRoot(childRoot);
  const index = rawChildren.indexOf(childRoot);
  const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
  const setRoot = (updatedRoot) => {
    rawChildren[index] = updatedRoot;
    if (dynamicChildren) {
      if (dynamicIndex > -1) dynamicChildren[dynamicIndex] = updatedRoot;
      else if (updatedRoot.patchFlag > 0) vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
    }
  };
  return [normalizeVNode(childRoot), setRoot];
};
function warnExtraneousAttributes(attrs) {
  const allAttrs = Object.keys(attrs);
  const eventAttrs = [];
  const extraAttrs = [];
  for (let i = 0, l = allAttrs.length; i < l; i++) {
    const key = allAttrs[i];
    if (isOn(key)) {
      if (!isModelListener(key)) eventAttrs.push(key[2].toLowerCase() + key.slice(3));
    } else extraAttrs.push(key);
  }
  if (extraAttrs.length) warn$1(`Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`);
  if (eventAttrs.length) warn$1(`Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`);
}
function filterSingleRoot(children, recurse = true) {
  let singleRoot;
  for (let i = 0; i < children.length; i++) {
    const child2 = children[i];
    if (isVNode(child2)) {
      if (child2.type !== Comment2 || child2.children === "v-if") if (singleRoot) return;
      else {
        singleRoot = child2;
        if (recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) return filterSingleRoot(singleRoot.children);
      }
    } else return;
  }
  return singleRoot;
}
var getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
  return res;
};
var filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
  return res;
};
var isElementRoot = (vnode) => {
  return vnode.shapeFlag & 7 || vnode.type === Comment2;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if ((prevChildren || nextChildren) && isHmrUpdating) return true;
  if (nextVNode.dirs || nextVNode.transition) return true;
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) return true;
    if (patchFlag & 16) {
      if (!prevProps) return !!nextProps;
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) return true;
    }
    if (prevProps === nextProps) return false;
    if (!prevProps) return !!nextProps;
    if (!nextProps) return true;
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) return true;
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) return !looseEqual(nextProp, prevProp);
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent && !parent.vapor) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) root.el = vnode.el;
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else break;
  }
}
var internalObjectProto = {};
var createInternalObject = () => Object.create(internalObjectProto);
var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = instance.props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
  if (true) validateProps(rawProps || {}, props, instance.propsOptions[0]);
  if (isStateful) instance.props = isSSR ? props : shallowReactive(props);
  else if (!instance.type.props) instance.props = attrs;
  else instance.props = props;
  instance.attrs = attrs;
}
function isInHmrContext(instance) {
  while (instance) {
    if (instance.type.__hmrId) return true;
    instance = instance.parent;
  }
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const { props, attrs, vnode: { patchFlag } } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (!isInHmrContext(instance) && (optimized || patchFlag > 0) && !(patchFlag & 16)) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) continue;
        const value = rawProps[key];
        if (options) if (hasOwn(attrs, key)) {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        } else {
          const camelizedKey = camelize(key);
          props[camelizedKey] = resolvePropValue(options, camelizedKey, value, instance, baseResolveDefault);
        }
        else if (value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
    let kebabKey;
    for (const key in rawCurrentProps) if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) if (options) {
      if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, key, void 0, instance, baseResolveDefault, true);
    } else delete props[key];
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) if (!rawProps || !hasOwn(rawProps, key) && true) {
        delete attrs[key];
        hasAttrsChanged = true;
      }
    }
  }
  if (hasAttrsChanged) trigger(instance.attrs, "set", "");
  if (true) validateProps(rawProps || {}, props, instance.propsOptions[0]);
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) for (let key in rawProps) {
    if (isReservedProp(key)) continue;
    const value = rawProps[key];
    let camelKey;
    if (options && hasOwn(options, camelKey = camelize(key))) if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
    else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
    else if (!isEmitListener(instance.emitsOptions, key)) {
      if (!(key in attrs) || value !== attrs[key]) {
        attrs[key] = value;
        hasAttrsChanged = true;
      }
    }
  }
  if (needCastKeys) {
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(options, key, castValues[key], instance, baseResolveDefault, !hasOwn(castValues, key));
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, key, value, instance, resolveDefault2, isAbsent = false) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const cachedDefaults = instance.propsDefaults || (instance.propsDefaults = {});
        if (hasOwn(cachedDefaults, key)) value = cachedDefaults[key];
        else value = cachedDefaults[key] = resolveDefault2(defaultValue, instance, key);
      } else value = defaultValue;
      if (instance.ce) instance.ce._setProp(key, value);
    }
    if (opt[0]) {
      if (isAbsent && !hasDefault) value = false;
      else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
    }
  }
  return value;
}
function baseResolveDefault(factory, instance, key) {
  let value;
  const prev = setCurrentInstance(instance);
  const props = toRaw(instance.props);
  value = factory.call(null, props);
  setCurrentInstance(...prev);
  return value;
}
var mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) return cached;
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
    if (comp.extends) extendProps(comp.extends);
    if (comp.mixins) comp.mixins.forEach(extendProps);
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) cache.set(comp, EMPTY_ARR);
    return EMPTY_ARR;
  }
  baseNormalizePropsOptions(raw, normalized, needCastKeys);
  const res = [normalized, needCastKeys];
  if (isObject(comp)) cache.set(comp, res);
  return res;
}
function baseNormalizePropsOptions(raw, normalized, needCastKeys) {
  if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
    if (!isString(raw[i])) warn$1(`props must be strings when using array syntax.`, raw[i]);
    const normalizedKey = camelize(raw[i]);
    if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
  }
  else if (raw) {
    if (!isObject(raw)) warn$1(`invalid props options`, raw);
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
          const type = propType[index];
          const typeName = isFunction(type) && type.name;
          if (typeName === "Boolean") {
            shouldCast = true;
            break;
          } else if (typeName === "String") shouldCastTrue = false;
        }
        else shouldCast = isFunction(propType) && propType.name === "Boolean";
        prop[0] = shouldCast;
        prop[1] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) needCastKeys.push(normalizedKey);
      }
    }
  }
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) return true;
  else if (true) warn$1(`Invalid prop name: "${key}" is a reserved property.`);
  return false;
}
function getType(ctor) {
  if (ctor === null) return "null";
  if (typeof ctor === "function") return ctor.name || "";
  else if (typeof ctor === "object") return ctor.constructor && ctor.constructor.name || "";
  return "";
}
function validateProps(rawProps, resolvedProps, options) {
  resolvedProps = toRaw(resolvedProps);
  const camelizePropsKey = Object.keys(rawProps).map((key) => camelize(key));
  for (const key in options) {
    const opt = options[key];
    if (opt != null) validateProp(key, resolvedProps[key], opt, resolvedProps, !camelizePropsKey.includes(key));
  }
}
function validateProp(key, value, propOptions, resolvedProps, isAbsent) {
  const { type, required, validator, skipCheck } = propOptions;
  if (required && isAbsent) {
    warn$1('Missing required prop: "' + key + '"');
    return;
  }
  if (value == null && !required) return;
  if (type != null && type !== true && !skipCheck) {
    let isValid = false;
    const types = isArray(type) ? type : [type];
    const expectedTypes = [];
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i]);
      expectedTypes.push(expectedType || "");
      isValid = valid;
    }
    if (!isValid) {
      warn$1(getInvalidTypeMessage(key, value, expectedTypes));
      return;
    }
  }
  if (validator && !validator(value, true ? shallowReadonly(resolvedProps) : resolvedProps)) warn$1('Invalid prop: custom validator check failed for prop "' + key + '".');
}
var isSimpleType = makeMap("String,Number,Boolean,Function,Symbol,BigInt");
function assertType(value, type) {
  let valid;
  const expectedType = getType(type);
  if (expectedType === "null") valid = value === null;
  else if (isSimpleType(expectedType)) {
    const t2 = typeof value;
    valid = t2 === expectedType.toLowerCase();
    if (!valid && t2 === "object") valid = value instanceof type;
  } else if (expectedType === "Object") valid = isObject(value);
  else if (expectedType === "Array") valid = isArray(value);
  else valid = value instanceof type;
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage(name, value, expectedTypes) {
  if (expectedTypes.length === 0) return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
  let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue(value, expectedType);
  const receivedValue = styleValue(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) message += ` with value ${expectedValue}`;
  message += `, got ${receivedType} `;
  if (isExplicable(receivedType)) message += `with value ${receivedValue}.`;
  return message;
}
function styleValue(value, type) {
  if (type === "String") return `"${value}"`;
  else if (type === "Number") return `${Number(value)}`;
  else return `${value}`;
}
function isExplicable(type) {
  return [
    "string",
    "number",
    "boolean"
  ].some((elem) => type.toLowerCase() === elem);
}
function isBoolean(...args) {
  return args.some((elem) => elem.toLowerCase() === "boolean");
}
var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
var normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) return rawSlot;
  const normalized = withCtx((...args) => {
    if (currentInstance && !currentInstance.vapor && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) warn$1(`Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`);
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
var normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
    else if (value != null) {
      if (true) warn$1(`Non-function value encountered for slot "${key}". Prefer function slots for better performance.`);
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
var normalizeVNodeSlots = (instance, children) => {
  if (!isKeepAlive(instance.vnode) && true) warn$1("Non-function value encountered for default slot. Prefer function slots for better performance.");
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
var assignSlots = (slots, children, optimized) => {
  for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
};
var initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) def(slots, "_", type, true);
    } else normalizeObjectSlots(children, slots, instance);
  } else if (children) normalizeVNodeSlots(instance, children);
};
var updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) if (isHmrUpdating) {
      assignSlots(slots, children, optimized);
      trigger(instance, "set", "$slots");
    } else if (optimized && type === 1) needDeletionCheck = false;
    else assignSlots(slots, children, optimized);
    else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots, instance);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
  }
};
var supported;
var perf;
var cachedNow = 0;
var p = Promise.resolve();
var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = isSupported() ? perf.now() : Date.now());
function startMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) perf.mark(`vue-${type}-${instance.uid}`);
  if (true) devtoolsPerfStart(instance, type, getNow());
}
function endMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    const startTag = `vue-${type}-${instance.uid}`;
    const endTag = startTag + `:end`;
    const measureName = `<${formatComponentName(instance, instance.type)}> ${type}`;
    perf.mark(endTag);
    perf.measure(measureName, startTag, endTag);
    perf.clearMeasures(measureName);
    perf.clearMarks(startTag);
    perf.clearMarks(endTag);
  }
  if (true) devtoolsPerfEnd(instance, type, getNow());
}
function isSupported() {
  if (supported !== void 0) return supported;
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else supported = false;
  return supported;
}
var initialized = false;
function initFeatureFlags() {
  if (initialized) return;
  const needWarn = [];
  if (typeof __VUE_OPTIONS_API__ !== "boolean") {
    needWarn.push(`__VUE_OPTIONS_API__`);
    getGlobalThis().__VUE_OPTIONS_API__ = true;
  }
  if (typeof __VUE_PROD_DEVTOOLS__ !== "boolean") {
    needWarn.push(`__VUE_PROD_DEVTOOLS__`);
    getGlobalThis().__VUE_PROD_DEVTOOLS__ = false;
  }
  if (typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ !== "boolean") {
    needWarn.push(`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`);
    getGlobalThis().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
  }
  if (needWarn.length) {
    const multi = needWarn.length > 1;
    console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`);
  }
  initialized = true;
}
var MoveType = {
  "ENTER": 0,
  "0": "ENTER",
  "LEAVE": 1,
  "1": "LEAVE",
  "REORDER": 2,
  "2": "REORDER"
};
var queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function createHydrationRenderer(options) {
  return baseCreateRenderer(options, createHydrationFunctions);
}
function baseCreateRenderer(options, createHydrationFns) {
  initFeatureFlags();
  const target = getGlobalThis();
  target.__VUE__ = true;
  if (true) setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
  const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense2 = null, namespace = void 0, slotScopeIds = null, optimized = isHmrUpdating ? false : !!n2.dynamicChildren) => {
    if (n1 === n2) return;
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense2, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref2, shapeFlag } = n2;
    switch (type) {
      case Text2:
        processText(n1, n2, container, anchor);
        break;
      case Comment2:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
        else if (true) patchStaticNode(n1, n2, container, namespace);
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        break;
      case VaporSlot:
        getVaporInterface(parentComponent, n2).slot(n1, n2, container, anchor, parentComponent, parentSuspense2);
        break;
      default:
        if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, internals);
        else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, internals);
        else if (true) warn$1("Invalid VNode type:", type, `(${typeof type})`);
    }
    if (ref2 != null && parentComponent) setRef(ref2, n1 && n1.ref, parentSuspense2, n2 || n1, !n2);
    else if (ref2 == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense2, n1, true);
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
    else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) hostSetText(el, n2.children);
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
    else n2.el = n1.el;
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
  };
  const patchStaticNode = (n1, n2, container, namespace) => {
    if (n2.children !== n1.children) {
      const anchor = hostNextSibling(n1.anchor);
      removeStaticNode(n1);
      [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace);
    } else {
      n2.el = n1.el;
      n2.anchor = n1.anchor;
    }
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next2;
    while (el && el !== anchor) {
      next2 = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next2;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next2;
    while (el && el !== anchor) {
      next2 = hostNextSibling(el);
      hostRemove(el);
      el = next2;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") namespace = "svg";
    else if (n2.type === "math") namespace = "mathml";
    if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
    else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) customElement._beginPatch();
        patchElement(n1, n2, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
      } finally {
        if (customElement) customElement._endPatch();
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
    if (shapeFlag & 8) hostSetElementText(el, vnode.children);
    else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense2, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
    if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
    setScopeId2(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
      if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
      if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (true) {
      def(el, "__vnode", vnode, true);
      def(el, "__vueParentComponent", parentComponent, true);
    }
    if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    if (transition) performTransitionEnter(el, transition, () => hostInsert(el, container, anchor), parentSuspense2);
    else hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || dirs) queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
      dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
    }, void 0, parentSuspense2);
  };
  const setScopeId2 = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) hostSetScopeId(el, scopeId);
    if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
    const inheritedScopeIds = getInheritedScopeIds(vnode, parentComponent);
    for (let i = 0; i < inheritedScopeIds.length; i++) hostSetScopeId(el, inheritedScopeIds[i]);
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) patch(null, children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]), container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    if (true) el.__vnode = n2;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    parentComponent && toggleRecurse(parentComponent, true);
    if (isHmrUpdating) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
    if (dynamicChildren) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense2, resolveChildrenNamespace(n2, namespace), slotScopeIds);
      if (true) traverseStaticChildren(n1, n2);
    } else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense2, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
    if (patchFlag > 0) {
      if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
      else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
        }
        if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next2 = newProps[key];
            if (next2 !== prev || key === "value") hostPatchProp(el, key, prev, next2, namespace, parentComponent);
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) hostSetElementText(el, n2.children);
      }
    } else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
      dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
    }, void 0, parentSuspense2);
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense2, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      patch(oldVNode, newVNode, oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer, null, parentComponent, parentSuspense2, namespace, slotScopeIds, true);
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next2 = newProps[key];
        const prev = oldProps[key];
        if (next2 !== prev && key !== "value") hostPatchProp(el, key, prev, next2, namespace, parentComponent);
      }
      if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (isHmrUpdating || patchFlag & 2048) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
    } else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
      patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense2, namespace, slotScopeIds);
      if (true) traverseStaticChildren(n1, n2);
      else if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
    } else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n2.type.__vapor) if (n1 == null) if (n2.shapeFlag & 512) getVaporInterface(parentComponent, n2).activate(n2, container, anchor, parentComponent);
    else {
      getVaporInterface(parentComponent, n2).mount(n2, container, anchor, parentComponent, parentSuspense2, () => {
        if (n2.dirs) {
          invokeDirectiveHook(n2, null, parentComponent, "created");
          invokeDirectiveHook(n2, null, parentComponent, "beforeMount");
        }
      });
      if (n2.dirs) queuePostRenderEffect(() => invokeDirectiveHook(n2, null, parentComponent, "mounted"), void 0, parentSuspense2);
    }
    else {
      getVaporInterface(parentComponent, n2).update(n1, n2, shouldUpdateComponent(n1, n2, optimized), () => {
        if (n2.dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
      });
      if (n2.dirs) queuePostRenderEffect(() => invokeDirectiveHook(n2, n1, parentComponent, "updated"), void 0, parentSuspense2);
    }
    else if (n1 == null) if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
    else mountComponent2(n2, container, anchor, parentComponent, parentSuspense2, namespace, optimized);
    else updateComponent(n1, n2, optimized);
  };
  const mountComponent2 = (initialVNode, container, anchor, parentComponent, parentSuspense2, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense2);
    if (instance.type.__hmrId) registerHMR(instance);
    if (true) {
      pushWarningContext(initialVNode);
      startMeasure(instance, `mount`);
    }
    if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
    if (true) startMeasure(instance, `init`);
    setupComponent(instance, false, optimized);
    if (true) endMeasure(instance, `init`);
    if (isHmrUpdating) initialVNode.el = null;
    if (instance.asyncDep) {
      if (parentSuspense2) {
        const hydratedEl = instance.vnode.el;
        parentSuspense2.registerDep(instance, (setupResult) => {
          const { vnode } = instance;
          if (true) pushWarningContext(vnode);
          handleSetupResult(instance, setupResult, false);
          if (hydratedEl) vnode.el = hydratedEl;
          const placeholder = !hydratedEl && instance.subTree.el;
          setupRenderEffect(instance, vnode, hostParentNode(hydratedEl || instance.subTree.el), hydratedEl ? null : getNextHostNode(instance.subTree), parentSuspense2, namespace, optimized);
          if (placeholder) {
            vnode.placeholder = null;
            hostRemove(placeholder);
          }
          updateHOCHostEl(instance, vnode.el);
          if (true) popWarningContext();
        });
      }
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment2);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense2, namespace, optimized);
    if (true) {
      popWarningContext();
      endMeasure(instance, `mount`);
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) if (instance.asyncDep && !instance.asyncResolved) {
      if (true) pushWarningContext(n2);
      updateComponentPreRender(instance, n2, optimized);
      if (true) popWarningContext();
      return;
    } else {
      instance.next = n2;
      instance.effect.run();
    }
    else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  class SetupRenderEffect extends ReactiveEffect {
    constructor(instance, initialVNode, container, anchor, parentSuspense2, namespace, optimized) {
      const prevScope = setCurrentScope(instance.scope);
      super();
      this.instance = instance;
      this.initialVNode = initialVNode;
      this.container = container;
      this.anchor = anchor;
      this.parentSuspense = parentSuspense2;
      this.namespace = namespace;
      this.optimized = optimized;
      setCurrentScope(prevScope);
      this.job = instance.job = () => {
        if (this.dirty) this.run();
      };
      this.job.i = instance;
      if (true) {
        this.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
        this.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
      }
    }
    notify() {
      if (!(this.flags & 256)) {
        const job = this.job;
        queueJob(job, job.i.uid);
      }
    }
    fn() {
      const { instance, initialVNode, container, anchor, parentSuspense: parentSuspense2, namespace, optimized } = this;
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) invokeArrayFns(bm);
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
        toggleRecurse(instance, true);
        if (el && hydrateNode2) {
          const hydrateSubTree = () => {
            if (true) startMeasure(instance, `render`);
            instance.subTree = renderComponentRoot(instance);
            if (true) endMeasure(instance, `render`);
            if (true) startMeasure(instance, `hydrate`);
            hydrateNode2(el, instance.subTree, instance, parentSuspense2, null);
            if (true) endMeasure(instance, `hydrate`);
          };
          if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
          else hydrateSubTree();
        } else {
          if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type);
          if (true) startMeasure(instance, `render`);
          const subTree = instance.subTree = renderComponentRoot(instance);
          if (true) endMeasure(instance, `render`);
          if (true) startMeasure(instance, `patch`);
          patch(null, subTree, container, anchor, instance, parentSuspense2, namespace);
          if (true) endMeasure(instance, `patch`);
          initialVNode.el = subTree.el;
        }
        if (instance.m) queuePostRenderEffect(instance.m, void 0, parentSuspense2);
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), void 0, parentSuspense2);
        }
        if (initialVNode.shapeFlag & 256 || parent && parent.vnode && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, void 0, parentSuspense2);
        instance.isMounted = true;
        if (true) devtoolsComponentAdded(instance);
        this.initialVNode = this.container = this.anchor = null;
      } else {
        let { next: next2, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next2) {
              next2.el = vnode.el;
              updateComponentPreRender(instance, next2, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) instance.update();
              }, void 0, parentSuspense2);
            });
            return;
          }
        }
        let originNext = next2;
        let vnodeHook;
        if (true) pushWarningContext(next2 || instance.vnode);
        toggleRecurse(instance, false);
        if (next2) {
          next2.el = vnode.el;
          updateComponentPreRender(instance, next2, optimized);
        } else next2 = vnode;
        if (bu) invokeArrayFns(bu);
        if (vnodeHook = next2.props && next2.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next2, vnode);
        toggleRecurse(instance, true);
        if (true) startMeasure(instance, `render`);
        const nextTree = renderComponentRoot(instance);
        if (true) endMeasure(instance, `render`);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        if (true) startMeasure(instance, `patch`);
        patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense2, namespace);
        if (true) endMeasure(instance, `patch`);
        next2.el = nextTree.el;
        if (originNext === null) updateHOCHostEl(instance, nextTree.el);
        if (u) queuePostRenderEffect(u, void 0, parentSuspense2);
        if (vnodeHook = next2.props && next2.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next2, vnode), void 0, parentSuspense2);
        if (true) devtoolsComponentUpdated(instance);
        if (true) popWarningContext();
      }
    }
  }
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense2, namespace, optimized) => {
    const effect2 = instance.effect = new SetupRenderEffect(instance, initialVNode, container, anchor, parentSuspense2, namespace, optimized);
    instance.update = effect2.run.bind(effect2);
    toggleRecurse(instance, true);
    effect2.run();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    const prevSub = setActiveSub();
    flushPreFlushCbs(instance);
    setActiveSub(prevSub);
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense2);
      if (c2 !== c1) hostSetElementText(container, c2);
    } else if (prevShapeFlag & 16) if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
    else unmountChildren(c1, parentComponent, parentSuspense2, true);
    else {
      if (prevShapeFlag & 8) hostSetElementText(container, "");
      if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
    }
    if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense2, true, false, commonLength);
    else mountChildren(c2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, commonLength);
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
      else break;
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
      else break;
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
          i++;
        }
      }
    } else if (i > e2) while (i <= e1) {
      unmount(c1[i], parentComponent, parentSuspense2, true);
      i++;
    }
    else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          if (keyToNewIndexMap.has(nextChild.key)) warn$1(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense2, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
        else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
          newIndex = j;
          break;
        }
        if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense2, true);
        else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
          else moved = true;
          patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized);
        else if (moved) if (j < 0 || i !== increasingNewIndexSequence[j]) move2(nextChild, container, anchor, 2, parentComponent);
        else j--;
      }
    }
  };
  const move2 = (vnode, container, anchor, moveType, parentComponent, parentSuspense2 = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (isVaporComponent(type) || type === VaporSlot) {
      getVaporInterface(parentComponent, vnode).move(vnode, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 6) {
      move2(vnode.component.subTree, container, anchor, moveType, parentComponent);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals, parentComponent);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) move2(children[i], container, anchor, moveType, parentComponent);
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    if (moveType !== 2 && shapeFlag & 1 && transition) if (moveType === 0) performTransitionEnter(el, transition, () => hostInsert(el, container, anchor), parentSuspense2, true);
    else {
      const { leave, delayLeave, afterLeave } = transition;
      const remove4 = () => {
        if (vnode.ctx.isUnmounted) hostRemove(el);
        else hostInsert(el, container, anchor);
      };
      const performLeave = () => {
        if (el._isLeaving) el[leaveCbKey](true);
        leave(el, () => {
          remove4();
          afterLeave && afterLeave();
        });
      };
      if (delayLeave) delayLeave(el, remove4, performLeave);
      else performLeave();
    }
    else hostInsert(el, container, anchor);
  };
  const unmount = (vnode, parentComponent, parentSuspense2, doRemove = false, optimized = false) => {
    const { type, props, ref: ref2, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex } = vnode;
    if (patchFlag === -2) optimized = false;
    if (ref2 != null) {
      const prevSub = setActiveSub();
      setRef(ref2, null, parentSuspense2, vnode, true);
      setActiveSub(prevSub);
    }
    if (cacheIndex != null) parentComponent.renderCache[cacheIndex] = void 0;
    if (shapeFlag & 256) {
      if (isVaporComponent(vnode.type)) getVaporInterface(parentComponent, vnode).deactivate(vnode, parentComponent.ctx.getStorageContainer());
      else parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
    if (shapeFlag & 6) if (isVaporComponent(type)) {
      if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      getVaporInterface(parentComponent, vnode).unmount(vnode, doRemove);
      if (dirs) queuePostRenderEffect(() => invokeDirectiveHook(vnode, null, parentComponent, "unmounted"), void 0, parentSuspense2);
      return;
    } else unmountComponent2(vnode.component, parentSuspense2, doRemove);
    else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense2, doRemove);
        return;
      }
      if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense2, internals, doRemove);
      else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense2, false, true);
      else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense2);
      if (type === VaporSlot) {
        getVaporInterface(parentComponent, vnode).unmount(vnode, doRemove);
        return;
      }
      if (doRemove) remove3(vnode);
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) queuePostRenderEffect(() => {
      vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
      shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
    }, void 0, parentSuspense2);
  };
  const remove3 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      if (vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) vnode.children.forEach((child2) => {
        if (child2.type === Comment2) hostRemove(child2.el);
        else remove3(child2);
      });
      else removeFragment(el, anchor);
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    if (transition) performTransitionLeave(el, transition, () => hostRemove(el), !!(vnode.shapeFlag & 1));
    else hostRemove(el);
  };
  const removeFragment = (cur, end) => {
    let next2;
    while (cur !== end) {
      next2 = hostNextSibling(cur);
      hostRemove(cur);
      cur = next2;
    }
    hostRemove(end);
  };
  const unmountComponent2 = (instance, parentSuspense2, doRemove) => {
    if (instance.type.__hmrId) unregisterHMR(instance);
    const { bum, scope, effect: effect2, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) invokeArrayFns(bum);
    scope.stop();
    if (effect2) {
      effect2.stop();
      unmount(subTree, instance, parentSuspense2, doRemove);
    }
    if (um) queuePostRenderEffect(um, void 0, parentSuspense2);
    queuePostRenderEffect(() => instance.isUnmounted = true, void 0, parentSuspense2);
    if (true) devtoolsComponentRemoved(instance);
  };
  const unmountChildren = (children, parentComponent, parentSuspense2, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense2, doRemove, optimized);
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      if (isVaporComponent(vnode.type)) return hostNextSibling(vnode.anchor);
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) return vnode.suspense.next();
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  const render2 = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else patch(container._vnode || null, vnode, container, null, null, null, namespace);
    container._vnode = vnode;
    flushOnAppMount(instance);
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move2,
    r: remove3,
    mt: mountComponent2,
    umt: unmountComponent2,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate2;
  let hydrateNode2;
  if (createHydrationFns) [hydrate2, hydrateNode2] = createHydrationFns(internals);
  const mountApp2 = (app, container, isHydrate, namespace) => {
    const vnode = app._ceVNode || createVNode(app._component, app._props);
    vnode.appContext = app._context;
    if (namespace === true) namespace = "svg";
    else if (namespace === false) namespace = void 0;
    if (true) app._context.reload = () => {
      const cloned = cloneVNode(vnode);
      cloned.el = null;
      render2(cloned, container, namespace);
    };
    if (isHydrate && hydrate2) hydrate2(vnode, container);
    else render2(vnode, container, namespace);
    return vnode.component;
  };
  const unmountApp2 = (app) => {
    render2(null, app._container);
  };
  return {
    render: render2,
    hydrate: hydrate2,
    hydrateNode: hydrateNode2,
    internals,
    createApp: createAppAPI(mountApp2, unmountApp2, getComponentPublicInstance, render2)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job, vapor }, allowed) {
  if (!vapor) if (allowed) {
    effect2.flags |= 128;
    job.flags |= 2;
  } else {
    effect2.flags &= -129;
    job.flags &= -3;
  }
}
function needTransition(parentSuspense2, transition) {
  return (!parentSuspense2 || parentSuspense2 && !parentSuspense2.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
    const c1 = ch1[i];
    let c2 = ch2[i];
    if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
      if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
        c2 = ch2[i] = cloneIfMounted(ch2[i]);
        c2.el = c1.el;
      }
      if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
    }
    if (c2.type === Text2) {
      if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
      c2.el = c1.el;
    }
    if (c2.type === Comment2 && !c2.el) c2.el = c1.el;
    if (true) c2.el && (c2.el.__vnode = c2);
  }
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree && instance.subTree.component;
  if (subComponent) if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
  else return locateNonHydratedAsyncRoot(subComponent);
}
function invalidateMount(hooks) {
  if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 4;
}
function performTransitionEnter(el, transition, insert2, parentSuspense2, force = false) {
  if (force || needTransition(parentSuspense2, transition)) {
    transition.beforeEnter(el);
    insert2();
    queuePostRenderEffect(() => transition.enter(el), void 0, parentSuspense2);
  } else insert2();
}
function performTransitionLeave(el, transition, remove3, isElement = true, force = false) {
  const performRemove = () => {
    remove3();
    if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
  };
  if (force || isElement && transition && !transition.persisted) {
    const { leave, delayLeave } = transition;
    const performLeave = () => {
      if (el._isLeaving && force) el[leaveCbKey](true);
      leave(el, performRemove);
    };
    if (delayLeave) delayLeave(el, performRemove, performLeave);
    else performLeave();
  } else performRemove();
}
function getVaporInterface(instance, vnode) {
  const ctx = instance ? instance.appContext : vnode.appContext;
  const res = ctx && ctx.vapor;
  if (!res) warn$1("Vapor component found in vdom tree but vapor-in-vdom interop was not installed. Make sure to install it:\n```\nimport { vaporInteropPlugin } from 'vue'\napp.use(vaporInteropPlugin)\n```");
  return res;
}
function isVaporComponent(type) {
  if (isHmrUpdating && hmrDirtyComponentsMode.has(type)) return hmrDirtyComponentsMode.get(type);
  return type.__vapor;
}
function getInheritedScopeIds(vnode, parentComponent) {
  const inheritedScopeIds = [];
  let currentParent = parentComponent;
  let currentVNode = vnode;
  while (currentParent) {
    let subTree = currentParent.subTree;
    if (!subTree) break;
    if (subTree.patchFlag > 0 && subTree.patchFlag & 2048) subTree = filterSingleRoot(subTree.children) || subTree;
    if (currentVNode === subTree || isSuspense(subTree.type) && (subTree.ssContent === currentVNode || subTree.ssFallback === currentVNode)) {
      const parentVNode = currentParent.vnode;
      if (parentVNode.scopeId) inheritedScopeIds.push(parentVNode.scopeId);
      if (parentVNode.slotScopeIds) inheritedScopeIds.push(...parentVNode.slotScopeIds);
      currentVNode = parentVNode;
      currentParent = currentParent.parent;
    } else break;
  }
  return inheritedScopeIds;
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) return anchorVnode.placeholder;
  const instance = anchorVnode.component;
  if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
  return null;
}
var isSuspense = (type) => type.__isSuspense;
var suspenseId = 0;
var SuspenseImpl = {
  name: "Suspense",
  __isSuspense: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, rendererInternals) {
    if (n1 == null) mountSuspense(n2, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, rendererInternals);
    else {
      if (parentSuspense2 && parentSuspense2.deps > 0 && !n1.suspense.isInFallback) {
        n2.suspense = n1.suspense;
        n2.suspense.vnode = n2;
        n2.el = n1.el;
        return;
      }
      patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, rendererInternals);
    }
  },
  hydrate: hydrateSuspense,
  normalize: normalizeSuspenseChildren
};
var Suspense = SuspenseImpl;
function triggerEvent(vnode, name) {
  const eventListener = vnode.props && vnode.props[name];
  if (isFunction(eventListener)) eventListener();
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, rendererInternals) {
  const { p: patch, o: { createElement: createElement2 } } = rendererInternals;
  const hiddenContainer = createElement2("div");
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense2, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals);
  patch(null, suspense.pendingBranch = vnode.ssContent, hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds);
  if (suspense.deps > 0) {
    triggerEvent(vnode, "onPending");
    triggerEvent(vnode, "onFallback");
    patch(null, vnode.ssFallback, container, anchor, parentComponent, null, namespace, slotScopeIds);
    setActiveBranch(suspense, vnode.ssFallback);
  } else suspense.resolve(false, true);
}
function patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement: createElement2 } }) {
  const suspense = n2.suspense = n1.suspense;
  suspense.vnode = n2;
  n2.el = n1.el;
  const newBranch = n2.ssContent;
  const newFallback = n2.ssFallback;
  const { activeBranch, pendingBranch, isInFallback, isHydrating: isHydrating2 } = suspense;
  if (pendingBranch) {
    suspense.pendingBranch = newBranch;
    if (isSameVNodeType(pendingBranch, newBranch)) {
      patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
      if (suspense.deps <= 0) suspense.resolve();
      else if (isInFallback) {
        if (!isHydrating2) {
          patch(activeBranch, newFallback, container, anchor, parentComponent, null, namespace, slotScopeIds, optimized);
          setActiveBranch(suspense, newFallback);
        }
      }
    } else {
      suspense.pendingId = suspenseId++;
      if (isHydrating2) {
        suspense.isHydrating = false;
        suspense.activeBranch = pendingBranch;
      } else unmount(pendingBranch, parentComponent, suspense);
      suspense.deps = 0;
      suspense.effects.length = 0;
      suspense.hiddenContainer = createElement2("div");
      if (isInFallback) {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
        if (suspense.deps <= 0) suspense.resolve();
        else {
          patch(activeBranch, newFallback, container, anchor, parentComponent, null, namespace, slotScopeIds, optimized);
          setActiveBranch(suspense, newFallback);
        }
      } else if (activeBranch && isSameVNodeType(activeBranch, newBranch)) {
        patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
        suspense.resolve(true);
      } else {
        patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
        if (suspense.deps <= 0) suspense.resolve();
      }
    }
  } else if (activeBranch && isSameVNodeType(activeBranch, newBranch)) {
    patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
    setActiveBranch(suspense, newBranch);
  } else {
    triggerEvent(n2, "onPending");
    suspense.pendingBranch = newBranch;
    if (newBranch.shapeFlag & 512) suspense.pendingId = newBranch.component.suspenseId;
    else suspense.pendingId = suspenseId++;
    patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
    if (suspense.deps <= 0) suspense.resolve();
    else {
      const { timeout, pendingId } = suspense;
      if (timeout > 0) setTimeout(() => {
        if (suspense.pendingId === pendingId) suspense.fallback(newFallback);
      }, timeout);
      else if (timeout === 0) suspense.fallback(newFallback);
    }
  }
}
var hasWarned = false;
function createSuspenseBoundary(vnode, parentSuspense2, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals, isHydrating2 = false) {
  if (!hasWarned) {
    hasWarned = true;
    console[console.info ? "info" : "log"](`<Suspense> is an experimental feature and its API will likely change.`);
  }
  const { p: patch, m: move2, um: unmount, n: next2, o: { parentNode: parentNode2 } } = rendererInternals;
  let parentSuspenseId;
  const isSuspensible = isVNodeSuspensible(vnode);
  if (isSuspensible) {
    if (parentSuspense2 && parentSuspense2.pendingBranch) {
      parentSuspenseId = parentSuspense2.pendingId;
      parentSuspense2.deps++;
    }
  }
  const timeout = vnode.props ? toNumber(vnode.props.timeout) : void 0;
  if (true) assertNumber(timeout, `Suspense timeout`);
  const initialAnchor = anchor;
  const suspense = {
    vnode,
    parent: parentSuspense2,
    parentComponent,
    namespace,
    container,
    hiddenContainer,
    deps: 0,
    pendingId: suspenseId++,
    timeout: typeof timeout === "number" ? timeout : -1,
    activeBranch: null,
    pendingBranch: null,
    isInFallback: !isHydrating2,
    isHydrating: isHydrating2,
    isUnmounted: false,
    effects: [],
    resolve(resume = false, sync = false) {
      if (true) {
        if (!resume && !suspense.pendingBranch) throw new Error(`suspense.resolve() is called without a pending branch.`);
        if (suspense.isUnmounted) throw new Error(`suspense.resolve() is called on an already unmounted suspense boundary.`);
      }
      const { vnode: vnode2, activeBranch, pendingBranch, pendingId, effects, parentComponent: parentComponent2, container: container2, isInFallback } = suspense;
      let delayEnter = false;
      if (suspense.isHydrating) suspense.isHydrating = false;
      else if (!resume) {
        delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
        if (delayEnter) activeBranch.transition.afterLeave = () => {
          if (pendingId === suspense.pendingId) {
            move2(pendingBranch, container2, anchor === initialAnchor ? next2(activeBranch) : anchor, 0, parentComponent2);
            queuePostFlushCb(effects);
            if (isInFallback && vnode2.ssFallback) vnode2.ssFallback.el = null;
          }
        };
        if (activeBranch) {
          if (parentNode2(activeBranch.el) === container2) anchor = next2(activeBranch);
          unmount(activeBranch, parentComponent2, suspense, true);
          if (!delayEnter && isInFallback && vnode2.ssFallback) queuePostRenderEffect(() => vnode2.ssFallback.el = null, void 0, suspense);
        }
        if (!delayEnter) move2(pendingBranch, container2, anchor, 0, parentComponent2);
      }
      setActiveBranch(suspense, pendingBranch);
      suspense.pendingBranch = null;
      suspense.isInFallback = false;
      let parent = suspense.parent;
      let hasUnresolvedAncestor = false;
      while (parent) {
        if (parent.pendingBranch) {
          parent.effects.push(...effects);
          hasUnresolvedAncestor = true;
          break;
        }
        parent = parent.parent;
      }
      if (!hasUnresolvedAncestor && !delayEnter) queuePostFlushCb(effects);
      suspense.effects = [];
      if (isSuspensible) {
        if (parentSuspense2 && parentSuspense2.pendingBranch && parentSuspenseId === parentSuspense2.pendingId) {
          parentSuspense2.deps--;
          if (parentSuspense2.deps === 0 && !sync) parentSuspense2.resolve();
        }
      }
      triggerEvent(vnode2, "onResolve");
    },
    fallback(fallbackVNode) {
      if (!suspense.pendingBranch) return;
      const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, namespace: namespace2 } = suspense;
      triggerEvent(vnode2, "onFallback");
      const anchor2 = next2(activeBranch);
      const mountFallback = () => {
        if (!suspense.isInFallback) return;
        patch(null, fallbackVNode, container2, anchor2, parentComponent2, null, namespace2, slotScopeIds, optimized);
        setActiveBranch(suspense, fallbackVNode);
      };
      const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
      if (delayEnter) activeBranch.transition.afterLeave = mountFallback;
      suspense.isInFallback = true;
      unmount(activeBranch, parentComponent2, null, true);
      if (!delayEnter) mountFallback();
    },
    move(container2, anchor2, type) {
      suspense.activeBranch && move2(suspense.activeBranch, container2, anchor2, type, parentComponent);
      suspense.container = container2;
    },
    next() {
      return suspense.activeBranch && next2(suspense.activeBranch);
    },
    registerDep(instance, onResolve) {
      const isInPendingSuspense = !!suspense.pendingBranch;
      if (isInPendingSuspense) suspense.deps++;
      instance.asyncDep.catch((err) => {
        handleError(err, instance, 0);
      }).then((asyncSetupResult) => {
        if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) return;
        instance.asyncResolved = true;
        onResolve(asyncSetupResult);
        if (isInPendingSuspense && --suspense.deps === 0) suspense.resolve();
      });
    },
    unmount(parentSuspense3, doRemove) {
      suspense.isUnmounted = true;
      if (suspense.activeBranch) unmount(suspense.activeBranch, parentComponent, parentSuspense3, doRemove);
      if (suspense.pendingBranch) unmount(suspense.pendingBranch, parentComponent, parentSuspense3, doRemove);
    }
  };
  return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense2, namespace, slotScopeIds, optimized, rendererInternals, hydrateNode2) {
  const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense2, parentComponent, node.parentNode, document.createElement("div"), null, namespace, slotScopeIds, optimized, rendererInternals, true);
  const result = hydrateNode2(node, suspense.pendingBranch = vnode.ssContent, parentComponent, suspense, slotScopeIds, optimized);
  if (suspense.deps === 0) suspense.resolve(false, true);
  return result;
}
function normalizeSuspenseChildren(vnode) {
  const { shapeFlag, children } = vnode;
  const isSlotChildren = shapeFlag & 32;
  vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
  vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment2);
}
function normalizeSuspenseSlot(s) {
  let block;
  if (isFunction(s)) {
    const trackBlock = isBlockTreeEnabled && s._c;
    if (trackBlock) {
      s._d = false;
      openBlock();
    }
    s = s();
    if (trackBlock) {
      s._d = true;
      block = currentBlock;
      closeBlock();
    }
  }
  if (isArray(s)) {
    const singleChild = filterSingleRoot(s);
    if (!singleChild && s.filter((child2) => child2 !== NULL_DYNAMIC_COMPONENT).length > 0) warn$1(`<Suspense> slots expect a single root node.`);
    s = singleChild;
  }
  s = normalizeVNode(s);
  if (block && !s.dynamicChildren) s.dynamicChildren = block.filter((c) => c !== s);
  return s;
}
function queueEffectWithSuspense(fn, id, suspense) {
  if (suspense && suspense.pendingBranch) if (isArray(fn)) suspense.effects.push(...fn);
  else suspense.effects.push(fn);
  else queuePostFlushCb(fn, id);
}
function setActiveBranch(suspense, branch) {
  suspense.activeBranch = branch;
  const { vnode, parentComponent } = suspense;
  let el = branch.el;
  while (!el && branch.component) {
    branch = branch.component.subTree;
    el = branch.el;
  }
  vnode.el = el;
  if (parentComponent && parentComponent.subTree === vnode) {
    parentComponent.vnode.el = el;
    updateHOCHostEl(parentComponent, el);
  }
}
function isVNodeSuspensible(vnode) {
  const suspensible = vnode.props && vnode.props.suspensible;
  return suspensible != null && suspensible !== false;
}
var Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
var Text2 = /* @__PURE__ */ Symbol.for("v-txt");
var Comment2 = /* @__PURE__ */ Symbol.for("v-cmt");
var Static = /* @__PURE__ */ Symbol.for("v-stc");
var VaporSlot = /* @__PURE__ */ Symbol.for("v-vps");
var blockStack = [];
var currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
var isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  if (n2.shapeFlag & 6 && n1.component) {
    const dirtyInstances = hmrDirtyComponents.get(n2.type);
    if (dirtyInstances && dirtyInstances.has(n1.component)) {
      n1.shapeFlag &= -257;
      n2.shapeFlag &= -513;
      return false;
    }
  }
  return n1.type === n2.type && n1.key === n2.key;
}
var vnodeArgsTransformer;
function transformVNodeArgs(transformer) {
  vnodeArgsTransformer = transformer;
}
var createVNodeWithArgsTransform = (...args) => {
  return _createVNode(...vnodeArgsTransformer ? vnodeArgsTransformer(args, currentRenderingInstance) : args);
};
var normalizeKey = ({ key }) => key != null ? key : null;
var normalizeRef = ({ ref: ref2, ref_key, ref_for }, i = currentRenderingInstance) => {
  if (typeof ref2 === "number") ref2 = "" + ref2;
  return ref2 != null ? isString(ref2) || isRef2(ref2) || isFunction(ref2) ? {
    i,
    r: ref2,
    k: ref_key,
    f: !!ref_for
  } : ref2 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) type.normalize(vnode);
  } else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
  if (vnode.key !== vnode.key) warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
  if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
  return vnode;
}
var createVNode = true ? createVNodeWithArgsTransform : _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    if (!type) warn$1(`Invalid vnode type when creating vnode: ${type}.`);
    type = Comment2;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(type, props, true);
    if (children) normalizeChildren(cloned, children);
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
    else currentBlock.push(cloned);
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) type = type.__vccOpts;
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) props.class = normalizeClass(klass);
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) style = extend({}, style);
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  if (shapeFlag & 4 && isProxy(type)) {
    type = toRaw(type);
    warn$1("Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.", `
Component that was made reactive: `, type);
  }
  return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
  if (!props) return null;
  return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref2, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? mergeRef && ref2 ? isArray(ref2) ? ref2.concat(normalizeRef(extraProps)) : [ref2, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref2,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children: patchFlag === -1 && isArray(children) ? children.map(deepCloneVNode) : children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
  return cloned;
}
function deepCloneVNode(vnode) {
  const cloned = cloneVNode(vnode);
  if (isArray(vnode.children)) cloned.children = vnode.children.map(deepCloneVNode);
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text2, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment2, null, text)) : createVNode(Comment2, null, text);
}
function normalizeVNode(child2) {
  if (child2 == null || typeof child2 === "boolean") return createVNode(Comment2);
  else if (isArray(child2)) return createVNode(Fragment, null, child2.slice());
  else if (isVNode(child2)) return cloneIfMounted(child2);
  else return createVNode(Text2, null, String(child2));
}
function cloneIfMounted(child2) {
  return child2.el === null && child2.patchFlag !== -1 || child2.memo ? child2 : cloneVNode(child2);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) children = null;
  else if (isArray(children)) type = 16;
  else if (typeof children === "object") if (shapeFlag & 65) {
    const slot = children.default;
    if (slot) {
      slot._c && (slot._d = false);
      normalizeChildren(vnode, slot());
      slot._c && (slot._d = true);
    }
    return;
  } else {
    type = 32;
    const slotFlag = children._;
    if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
    else if (slotFlag === 3 && currentRenderingInstance) if (currentRenderingInstance.slots._ === 1) children._ = 1;
    else {
      children._ = 2;
      vnode.patchFlag |= 1024;
    }
  }
  else if (isFunction(children)) {
    children = {
      default: children,
      _ctx: currentRenderingInstance
    };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else type = 8;
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) if (key === "class") {
      if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
    } else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
    else if (isOn(key)) {
      const existing = ret[key];
      const incoming = toMerge[key];
      if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
    } else if (key !== "") ret[key] = toMerge[key];
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
}
var currentInstance = null;
var getCurrentGenericInstance = () => currentInstance || currentRenderingInstance;
var getCurrentInstance = () => currentInstance && !currentInstance.vapor ? currentInstance : currentRenderingInstance;
var isInSSRComponentSetup = false;
var setInSSRSetupState;
var simpleSetCurrentInstance;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  simpleSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
  setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
}
var setCurrentInstance = (instance, scope = instance !== null ? instance.scope : void 0) => {
  try {
    return [currentInstance, setCurrentScope(scope)];
  } finally {
    simpleSetCurrentInstance(instance);
  }
};
var internalOptions = [
  "ce",
  "type",
  "uid"
];
var useInstanceOption = (key, silent = false) => {
  const instance = getCurrentGenericInstance();
  if (!instance) {
    if (!silent) warn$1(`useInstanceOption called without an active component instance.`);
    return {
      hasInstance: false,
      value: void 0
    };
  }
  if (!internalOptions.includes(key)) {
    if (true) warn$1(`useInstanceOption only accepts  ${internalOptions.map((k) => `'${k}'`).join(", ")} as key, got '${key}'.`);
    return {
      hasInstance: true,
      value: void 0
    };
  }
  return {
    hasInstance: true,
    value: instance[key]
  };
};
var emptyAppContext = createAppContext();
var uid = 0;
function nextUid() {
  return uid++;
}
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    job: null,
    scope: new EffectScope(true),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : [
      "",
      0,
      0
    ],
    accessCache: null,
    renderCache: [],
    components: null,
    directives: null,
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    emit: null,
    emitted: null,
    propsDefaults: null,
    inheritAttrs: type.inheritAttrs,
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  if (true) instance.ctx = createDevRenderContext(instance);
  else instance.ctx = { _: instance };
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) vnode.ce(instance);
  return instance;
}
function validateComponentName(name, { isNativeTag }) {
  if (isBuiltInTag(name) || isNativeTag(name)) warn$1("Do not use built-in or reserved HTML elements as component id: " + name);
}
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children, vi } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  if (vi) vi(instance);
  else {
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children, optimized || isSSR);
  }
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  if (true) {
    if (Component.name) validateComponentName(Component.name, instance.appContext.config);
    if (Component.components) {
      const names = Object.keys(Component.components);
      for (let i = 0; i < names.length; i++) validateComponentName(names[i], instance.appContext.config);
    }
    if (Component.directives) {
      const names = Object.keys(Component.directives);
      for (let i = 0; i < names.length; i++) validateDirectiveName(names[i]);
    }
    if (Component.compilerOptions && isRuntimeOnly()) warn$1('"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.');
  }
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  if (true) exposePropsOnRenderContext(instance);
  const { setup } = Component;
  if (setup) {
    const prevSub = setActiveSub();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const prev = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(setup, instance, 0, [true ? shallowReadonly(instance.props) : instance.props, setupContext]);
    const isAsyncSetup = isPromise(setupResult);
    setActiveSub(prevSub);
    setCurrentInstance(...prev);
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
    if (isAsyncSetup) {
      const unsetCurrentInstance = () => {
        setCurrentInstance(null, void 0);
      };
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) return setupResult.then((resolvedResult) => {
        handleSetupResult(instance, resolvedResult, isSSR);
      }).catch((e) => {
        handleError(e, instance, 0);
      });
      else {
        instance.asyncDep = setupResult;
        if (!instance.suspense) warn$1(`Component <${formatComponentName(instance, Component)}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
      }
    } else handleSetupResult(instance, setupResult, isSSR);
  } else finishComponentSetup(instance, isSSR);
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
  else instance.render = setupResult;
  else if (isObject(setupResult)) {
    if (isVNode(setupResult)) warn$1("setup() should not return VNodes directly - return a render function instead.");
    if (true) instance.devtoolsRawSetupState = setupResult;
    instance.setupState = proxyRefs(setupResult);
    if (true) exposeSetupStateOnRenderContext(instance);
  } else if (setupResult !== void 0) warn$1(`setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`);
  finishComponentSetup(instance, isSSR);
}
var compile;
var installWithProxy;
function registerRuntimeCompiler(_compile) {
  compile = _compile;
  installWithProxy = (i) => {
    if (i.render._rc) i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
  };
}
var isRuntimeOnly = () => !compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template2 = Component.template || __VUE_OPTIONS_API__ && resolveMergedOptions(instance).template;
      if (template2) {
        if (true) startMeasure(instance, `compile`);
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend(extend({
          isCustomElement,
          delimiters
        }, compilerOptions), componentCompilerOptions);
        Component.render = compile(template2, finalCompilerOptions);
        if (true) endMeasure(instance, `compile`);
      }
    }
    instance.render = Component.render || NOOP;
    if (installWithProxy) installWithProxy(instance);
  }
  if (__VUE_OPTIONS_API__ && true) {
    const prevInstance = setCurrentInstance(instance);
    const prevSub = setActiveSub();
    try {
      applyOptions(instance);
    } finally {
      setActiveSub(prevSub);
      setCurrentInstance(...prevInstance);
    }
  }
  if (!Component.render && instance.render === NOOP && !isSSR) if (!compile && Component.template)
    warn$1('Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".');
  else warn$1(`Component is missing template or render function: `, Component);
}
var attrsProxyHandlers = true ? {
  get(target, key) {
    markAttrsAccessed();
    track(target, "get", "");
    return target[key];
  },
  set() {
    warn$1(`setupContext.attrs is readonly.`);
    return false;
  },
  deleteProperty() {
    warn$1(`setupContext.attrs is readonly.`);
    return false;
  }
} : { get(target, key) {
  track(target, "get", "");
  return target[key];
} };
function getSlotsProxy(instance) {
  return new Proxy(instance.slots, { get(target, key) {
    track(instance, "get", "$slots");
    return target[key];
  } });
}
function createSetupContext(instance) {
  if (true) {
    let attrsProxy;
    let slotsProxy;
    return Object.freeze({
      get attrs() {
        return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
      },
      get slots() {
        return slotsProxy || (slotsProxy = getSlotsProxy(instance));
      },
      get emit() {
        return (event, ...args) => instance.emit(event, ...args);
      },
      expose: (exposed) => expose(instance, exposed)
    });
  } else return {
    attrs: new Proxy(instance.attrs, attrsProxyHandlers),
    slots: instance.slots,
    emit: instance.emit,
    expose: (exposed) => expose(instance, exposed)
  };
}
function expose(instance, exposed) {
  if (true) {
    if (instance.exposed) warn$1(`expose() should be called only once per setup().`);
    if (exposed != null) {
      let exposedType = typeof exposed;
      if (exposedType === "object") {
        if (isArray(exposed)) exposedType = "array";
        else if (isRef2(exposed)) exposedType = "ref";
      }
      if (exposedType !== "object") warn$1(`expose() should be passed a plain object, received ${exposedType}.`);
    }
  }
  instance.exposed = exposed || {};
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
    get(target, key) {
      if (key in target) return target[key];
      else {
        const publicPropertiesMap2 = getPublicPropertiesMap();
        if (key in publicPropertiesMap2) return publicPropertiesMap2[key](instance);
      }
    },
    has(target, key) {
      const publicPropertiesMap2 = getPublicPropertiesMap();
      return key in target || key in publicPropertiesMap2;
    }
  }));
  else return instance.proxy;
}
var classifyRE = /(?:^|[-_])\w/g;
var classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) name = match[1];
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) if (registry[key] === Component) return key;
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
var computed2 = (getterOrOptions, debugOptions) => {
  return computed(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) return createVNode(type, null, [propsOrChildren]);
      return createVNode(type, propsOrChildren);
    } else return createVNode(type, null, propsOrChildren);
    else {
      if (l > 3) children = Array.prototype.slice.call(arguments, 2);
      else if (l === 3 && isVNode(children)) children = [children];
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}
function initCustomFormatter() {
  if (typeof window === "undefined") return;
  const vueStyle = { style: "color:#3ba776" };
  const numberStyle = { style: "color:#1677ff" };
  const stringStyle = { style: "color:#f5222d" };
  const keywordStyle = { style: "color:#eb2f96" };
  const formatter = {
    __vue_custom_formatter: true,
    header(obj) {
      if (!isObject(obj)) return null;
      if (obj.__isVue) return [
        "div",
        vueStyle,
        `VueInstance`
      ];
      else if (isRef2(obj)) {
        const prevSub = setActiveSub();
        const value = obj.value;
        setActiveSub(prevSub);
        return [
          "div",
          {},
          [
            "span",
            vueStyle,
            genRefFlag(obj)
          ],
          "<",
          formatValue(value),
          `>`
        ];
      } else if (isReactive(obj)) return [
        "div",
        {},
        [
          "span",
          vueStyle,
          isShallow(obj) ? "ShallowReactive" : "Reactive"
        ],
        "<",
        formatValue(obj),
        `>${isReadonly(obj) ? ` (readonly)` : ``}`
      ];
      else if (isReadonly(obj)) return [
        "div",
        {},
        [
          "span",
          vueStyle,
          isShallow(obj) ? "ShallowReadonly" : "Readonly"
        ],
        "<",
        formatValue(obj),
        ">"
      ];
      return null;
    },
    hasBody(obj) {
      return obj && obj.__isVue;
    },
    body(obj) {
      if (obj && obj.__isVue) return [
        "div",
        {},
        ...formatInstance(obj.$)
      ];
    }
  };
  function formatInstance(instance) {
    const blocks = [];
    if (instance.type.props && instance.props) blocks.push(createInstanceBlock("props", toRaw(instance.props)));
    if (instance.setupState !== EMPTY_OBJ) blocks.push(createInstanceBlock("setup", instance.setupState));
    if (instance.data !== EMPTY_OBJ) blocks.push(createInstanceBlock("data", toRaw(instance.data)));
    const computed3 = extractKeys(instance, "computed");
    if (computed3) blocks.push(createInstanceBlock("computed", computed3));
    const injected = extractKeys(instance, "inject");
    if (injected) blocks.push(createInstanceBlock("injected", injected));
    blocks.push([
      "div",
      {},
      [
        "span",
        { style: keywordStyle.style + ";opacity:0.66" },
        "$ (internal): "
      ],
      ["object", { object: instance }]
    ]);
    return blocks;
  }
  function createInstanceBlock(type, target) {
    target = extend({}, target);
    if (!Object.keys(target).length) return ["span", {}];
    return [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        { style: "color:#476582" },
        type
      ],
      [
        "div",
        { style: "padding-left:1.25em" },
        ...Object.keys(target).map((key) => {
          return [
            "div",
            {},
            [
              "span",
              keywordStyle,
              key + ": "
            ],
            formatValue(target[key], false)
          ];
        })
      ]
    ];
  }
  function formatValue(v, asRaw = true) {
    if (typeof v === "number") return [
      "span",
      numberStyle,
      v
    ];
    else if (typeof v === "string") return [
      "span",
      stringStyle,
      JSON.stringify(v)
    ];
    else if (typeof v === "boolean") return [
      "span",
      keywordStyle,
      v
    ];
    else if (isObject(v)) return ["object", { object: asRaw ? toRaw(v) : v }];
    else return [
      "span",
      stringStyle,
      String(v)
    ];
  }
  function extractKeys(instance, type) {
    const Comp = instance.type;
    if (isFunction(Comp)) return;
    const extracted = {};
    for (const key in instance.ctx) if (isKeyOfType(Comp, key, type)) extracted[key] = instance.ctx[key];
    return extracted;
  }
  function isKeyOfType(Comp, key, type) {
    const opts = Comp[type];
    if (isArray(opts) && opts.includes(key) || isObject(opts) && key in opts) return true;
    if (Comp.extends && isKeyOfType(Comp.extends, key, type)) return true;
    if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) return true;
  }
  function genRefFlag(v) {
    if (isShallow(v)) return `ShallowRef`;
    if (v.effect) return `ComputedRef`;
    return `Ref`;
  }
  if (window.devtoolsFormatters) window.devtoolsFormatters.push(formatter);
  else window.devtoolsFormatters = [formatter];
}
function withMemo(memo, render2, cache, index) {
  const cached = cache[index];
  if (cached && isMemoSame(cached, memo)) return cached;
  const ret = render2();
  ret.memo = memo.slice();
  ret.cacheIndex = index;
  return cache[index] = ret;
}
function isMemoSame(cached, memo) {
  const prev = cached.memo;
  if (prev.length != memo.length) return false;
  for (let i = 0; i < prev.length; i++) if (hasChanged(prev[i], memo[i])) return false;
  if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(cached);
  return true;
}
var version = "3.6.0-beta.7";
var warn2 = true ? warn$1 : NOOP;
var ErrorTypeStrings = ErrorTypeStrings$1;
var devtools = ("development", devtools$1);
var setDevtoolsHook = ("development", setDevtoolsHook$1);
var _ssrUtils = {
  createComponentInstance,
  setupComponent,
  renderComponentRoot,
  setCurrentRenderingInstance,
  isVNode,
  normalizeVNode,
  getComponentPublicInstance,
  ensureValidVNode,
  pushWarningContext,
  popWarningContext
};
var ssrUtils = _ssrUtils;
var resolveFilter = null;
var compatUtils = null;
var DeprecationTypes = null;

// node_modules/.pnpm/@vue+runtime-dom@3.6.0-beta.7/node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
var policy = void 0;
var tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) try {
  policy = tt.createPolicy("vue", { createHTML: (val) => val });
} catch (e) {
  warn2(`Error creating trusted types policy: ${e}`);
}
var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
var svgNS = "http://www.w3.org/2000/svg";
var mathmlNS = "http://www.w3.org/1998/Math/MathML";
var doc = typeof document !== "undefined" ? document : null;
var templateContainer = doc && doc.createElement("template");
var nodeOps = {
  insert: (child2, parent, anchor) => {
    parent.insertBefore(child2, anchor || null);
  },
  remove: (child2) => {
    const parent = child2.parentNode;
    if (parent) parent.removeChild(child2);
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) while (true) {
      parent.insertBefore(start.cloneNode(true), anchor);
      if (start === end || !(start = start.nextSibling)) break;
    }
    else {
      templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
      const template2 = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template2.firstChild;
        while (wrapper.firstChild) template2.appendChild(wrapper.firstChild);
        template2.removeChild(wrapper);
      }
      parent.insertBefore(template2, anchor);
    }
    return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
  }
};
var TRANSITION = "transition";
var ANIMATION = "animation";
var vtcKey = /* @__PURE__ */ Symbol("_vtc");
var DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [
    String,
    Number,
    Object
  ],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
var TransitionPropsValidators = extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
var decorate$1 = (t2) => {
  t2.displayName = "Transition";
  t2.props = TransitionPropsValidators;
  return t2;
};
var Transition = decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
var callHook2 = (hook, args = []) => {
  if (isArray(hook)) hook.forEach((h2) => h2(...args));
  else if (hook) hook(...args);
};
var hasExplicitCallback = (hook) => {
  return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
  if (rawProps.css === false) return baseProps;
  const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
  const finishEnter = (el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook2(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve2);
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook2(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook2(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) return;
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve2);
      });
      callHook2(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook2(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook2(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook2(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) return null;
  else if (isObject(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
  else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  if (true) assertNumber(res, "<transition> explicit duration");
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) el[vtcKey] = void 0;
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
var endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) resolve2();
  };
  if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) return resolve2();
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) end();
  };
  setTimeout(() => {
    if (ended < propCount) end();
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) delays = delays.concat(delays);
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
  return (el ? el.ownerDocument : document).body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  if (value == null) el.removeAttribute("class");
  else if (isSVG) el.setAttribute("class", value);
  else el.className = value;
}
var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
var vShow = {
  name: "show",
  beforeMount(el, { value }, { transition }) {
    el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) transition.beforeEnter(el);
    else setDisplay(el, value);
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) transition.enter(el);
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue) return;
    if (transition) if (value) {
      transition.beforeEnter(el);
      setDisplay(el, true);
      transition.enter(el);
    } else transition.leave(el, () => {
      setDisplay(el, false);
    });
    else setDisplay(el, value);
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el[vShowOriginalDisplay] : "none";
  el[vShowHidden] = !value;
}
function initVShowForSSR() {
  vShow.getSSRProps = ({ value }) => {
    if (!value) return { style: { display: "none" } };
  };
}
var CSS_VAR_TEXT = /* @__PURE__ */ Symbol(true ? "CSS_VAR_TEXT" : "");
function useCssVars(getter) {
  const instance = getCurrentInstance();
  const getVars = () => getter(instance.proxy);
  const setVars2 = (vars) => {
    if (instance.ce) setVarsOnNode(instance.ce, vars);
    else setVarsOnVNode(instance.subTree, vars);
  };
  baseUseCssVars(instance, () => instance.subTree.el.parentNode, getVars, setVars2);
}
function setVarsOnVNode(vnode, vars) {
  if (vnode.shapeFlag & 128) {
    const suspense = vnode.suspense;
    vnode = suspense.activeBranch;
    if (suspense.pendingBranch && !suspense.isHydrating) suspense.effects.push(() => {
      setVarsOnVNode(suspense.activeBranch, vars);
    });
  }
  while (vnode.component) vnode = vnode.component.subTree;
  if (vnode.shapeFlag & 1 && vnode.el) setVarsOnNode(vnode.el, vars);
  else if (vnode.type === Fragment) vnode.children.forEach((c) => setVarsOnVNode(c, vars));
  else if (vnode.type === Static) {
    let { el, anchor } = vnode;
    while (el) {
      setVarsOnNode(el, vars);
      if (el === anchor) break;
      el = el.nextSibling;
    }
  }
}
function baseUseCssVars(instance, getParentNode, getVars, setVars2) {
  if (!instance) {
    warn2(`useCssVars is called without current active component instance.`);
    return;
  }
  if (true) instance.getCssVars = getVars;
  const updateTeleports = instance.ut = (vars = getVars()) => {
    Array.from(document.querySelectorAll(`[data-v-owner="${instance.uid}"]`)).forEach((node) => setVarsOnNode(node, vars));
  };
  const applyCssVars = (vars = getVars()) => {
    setVars2(vars);
    updateTeleports(vars);
  };
  onBeforeUpdate(() => {
    queuePostFlushCb(applyCssVars);
  });
  onMounted(() => {
    watch2(() => {
      const vars = getVars();
      extend({}, vars);
      applyCssVars(vars);
    }, NOOP, { flush: "post" });
    const ob = new MutationObserver(() => applyCssVars());
    ob.observe(getParentNode(), { childList: true });
    onUnmounted(() => ob.disconnect());
  });
}
function setVarsOnNode(el, vars) {
  if (el.nodeType === 1) {
    const style = el.style;
    let cssText = "";
    for (const key in vars) {
      const value = normalizeCssVarValue(vars[key]);
      style.setProperty(`--${key}`, value);
      cssText += `--${key}: ${value};`;
    }
    style[CSS_VAR_TEXT] = cssText;
  }
}
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next2) {
  const style = el.style;
  const isCssString = isString(next2);
  let hasControlledDisplay = false;
  if (next2 && !isCssString) {
    if (prev) if (!isString(prev)) {
      for (const key in prev) if (next2[key] == null) setStyle(style, key, "");
    } else for (const prevStyle of prev.split(";")) {
      const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
      if (next2[key] == null) setStyle(style, key, "");
    }
    for (const key in next2) {
      if (key === "display") hasControlledDisplay = true;
      setStyle(style, key, next2[key]);
    }
  } else if (isCssString) {
    if (prev !== next2) {
      const cssVarText = style[CSS_VAR_TEXT];
      if (cssVarText) next2 += ";" + cssVarText;
      style.cssText = next2;
      hasControlledDisplay = displayRE.test(next2);
    }
  } else if (prev) el.removeAttribute("style");
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) style.display = "none";
  }
}
var semicolonRE = /[^\\];\s*$/;
var importantRE = /\s*!important$/;
function setStyle(style, name, rawVal) {
  if (isArray(rawVal)) rawVal.forEach((v) => setStyle(style, name, v));
  else {
    const val = rawVal == null ? "" : String(rawVal);
    if (true) {
      if (semicolonRE.test(val)) warn2(`Unexpected semicolon at the end of '${name}' style value: '${val}'`);
    }
    if (name.startsWith("--")) style.setProperty(name, val);
    else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
      else style[prefixed] = val;
    }
  }
}
var prefixes = [
  "Webkit",
  "Moz",
  "ms"
];
var prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) return cached;
  let name = camelize(rawName);
  if (name !== "filter" && name in style) return prefixCache[rawName] = name;
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) return prefixCache[rawName] = prefixed;
  }
  return rawName;
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean2 = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
  else el.setAttributeNS(xlinkNS, key, value);
  else if (value == null || isBoolean2 && !includeBooleanAttr(value)) el.removeAttribute(key);
  else el.setAttribute(key, isBoolean2 ? "" : isSymbol(value) ? String(value) : value);
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    return;
  }
  const tag = el.tagName;
  if (key === "value" && canSetValueDirectly(tag)) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
    if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
    if (value == null) el.removeAttribute(key);
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") value = includeBooleanAttr(value);
    else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
    if (!needRemove) warn2(`Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`, e);
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
var veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) existingInvoker.value = true ? sanitizeEventValue(nextValue, rawName) : nextValue;
  else {
    const [name, options] = parseName(rawName);
    if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(true ? sanitizeEventValue(nextValue, rawName) : nextValue, instance), options);
    else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
var optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
}
var cachedNow2 = 0;
var p2 = Promise.resolve();
var getNow2 = () => cachedNow2 || (p2.then(() => cachedNow2 = 0), cachedNow2 = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) e._vts = Date.now();
    else if (e._vts <= invoker.attached) return;
    callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
  };
  invoker.value = initialValue;
  invoker.attached = getNow2();
  return invoker;
}
function sanitizeEventValue(value, propName) {
  if (isFunction(value) || isArray(value)) return value;
  warn2(`Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`);
  return NOOP;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else return value;
}
var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") patchClass(el, nextValue, isSVG);
  else if (key === "style") patchStyle(el, prevValue, nextValue);
  else if (isOn(key)) {
    if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue, parentComponent);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
  } else if (el._isVueCE && (/[A-Z]/.test(key) || !isString(nextValue))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  else {
    if (key === "true-value") el._trueValue = nextValue;
    else if (key === "false-value") el._falseValue = nextValue;
    patchAttr(el, key, nextValue, isSVG, parentComponent);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") return true;
    if (key in el && isNativeOn(key) && isFunction(value)) return true;
    return false;
  }
  if (shouldSetAsAttr(el.tagName, key)) return false;
  if (isNativeOn(key) && isString(value)) return false;
  return key in el;
}
var REMOVAL = {};
function defineCustomElement(options, extraOptions, _createApp2) {
  let Comp = defineComponent(options, extraOptions);
  if (isPlainObject(Comp)) Comp = extend({}, Comp, extraOptions);
  class VueCustomElement extends VueElement {
    constructor(initialProps) {
      super(Comp, initialProps, _createApp2);
    }
  }
  VueCustomElement.def = Comp;
  return VueCustomElement;
}
var defineSSRCustomElement = ((options, extraOptions) => {
  return defineCustomElement(options, extraOptions, createSSRApp);
});
var BaseClass = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
var VueElementBase = class VueElementBase2 extends BaseClass {
  constructor(def2, props = {}, createAppFn) {
    super();
    this._isVueCE = true;
    this._instance = null;
    this._app = null;
    this._connected = false;
    this._resolved = false;
    this._numberProps = null;
    this._styleChildren = /* @__PURE__ */ new WeakSet();
    this._patching = false;
    this._dirty = false;
    this._ob = null;
    this._def = def2;
    this._props = props;
    this._createApp = createAppFn;
    this._nonce = def2.nonce;
    if (this._needsHydration()) this._root = this.shadowRoot;
    else if (def2.shadowRoot !== false) {
      this.attachShadow(extend({}, def2.shadowRootOptions, { mode: "open" }));
      this._root = this.shadowRoot;
    } else this._root = this;
  }
  connectedCallback() {
    if (!this.isConnected) return;
    if (!this.shadowRoot && !this._resolved) this._parseSlots();
    this._connected = true;
    let parent = this;
    while (parent = parent && (parent.parentNode || parent.host)) if (parent instanceof VueElementBase2) {
      this._parent = parent;
      break;
    }
    if (!this._instance) if (this._resolved) this._mountComponent(this._def);
    else if (parent && parent._pendingResolve) this._pendingResolve = parent._pendingResolve.then(() => {
      this._pendingResolve = void 0;
      this._resolveDef();
    });
    else this._resolveDef();
  }
  disconnectedCallback() {
    this._connected = false;
    nextTick(() => {
      if (!this._connected) {
        if (this._ob) {
          this._ob.disconnect();
          this._ob = null;
        }
        this._unmount();
        if (this._teleportTargets) {
          this._teleportTargets.clear();
          this._teleportTargets = void 0;
        }
      }
    });
  }
  _setParent(parent = this._parent) {
    if (parent && this._instance) {
      this._instance.parent = parent._instance;
      this._inheritParentContext(parent);
    }
  }
  _inheritParentContext(parent = this._parent) {
    if (parent && this._app) Object.setPrototypeOf(this._app._context.provides, parent._instance.provides);
  }
  _processMutations(mutations) {
    for (const m of mutations) this._setAttr(m.attributeName);
  }
  /**
  * resolve inner component definition (handle possible async component)
  */
  _resolveDef() {
    if (this._pendingResolve) return;
    for (let i = 0; i < this.attributes.length; i++) this._setAttr(this.attributes[i].name);
    this._ob = new MutationObserver(this._processMutations.bind(this));
    this._ob.observe(this, { attributes: true });
    const resolve2 = (def2) => {
      this._resolved = true;
      this._pendingResolve = void 0;
      const { props, styles } = def2;
      let numberProps;
      if (props && !isArray(props)) for (const key in props) {
        const opt = props[key];
        if (opt === Number || opt && opt.type === Number) {
          if (key in this._props) this._props[key] = toNumber(this._props[key]);
          (numberProps || (numberProps = /* @__PURE__ */ Object.create(null)))[camelize(key)] = true;
        }
      }
      this._numberProps = numberProps;
      this._resolveProps(def2);
      if (this.shadowRoot) this._applyStyles(styles);
      else if (styles) warn2("Custom element style injection is not supported when using shadowRoot: false");
      this._mountComponent(def2);
    };
    const asyncDef = this._def.__asyncLoader;
    if (asyncDef) {
      const { configureApp } = this._def;
      this._pendingResolve = asyncDef().then((def2) => {
        def2.configureApp = configureApp;
        this._def = def2;
        resolve2(def2);
      });
    } else resolve2(this._def);
  }
  _mountComponent(def2) {
    this._mount(def2);
    this._processExposed();
  }
  _processExposed() {
    const exposed = this._instance && this._instance.exposed;
    if (!exposed) return;
    for (const key in exposed) if (!hasOwn(this, key)) Object.defineProperty(this, key, { get: () => unref(exposed[key]) });
    else if (true) warn2(`Exposed property "${key}" already exists on custom element.`);
  }
  _processInstance() {
    this._instance.ce = this;
    this._instance.isCE = true;
    if (true) this._instance.ceReload = (newStyles) => {
      if (this._styles) {
        this._styles.forEach((s) => this._root.removeChild(s));
        this._styles.length = 0;
      }
      this._applyStyles(newStyles);
      if (!this._instance.vapor) this._instance = null;
      this._update();
    };
    const dispatch = (event, args) => {
      this.dispatchEvent(new CustomEvent(event, isPlainObject(args[0]) ? extend({ detail: args }, args[0]) : { detail: args }));
    };
    this._instance.emit = (event, ...args) => {
      dispatch(event, args);
      if (hyphenate(event) !== event) dispatch(hyphenate(event), args);
    };
    this._setParent();
  }
  _resolveProps(def2) {
    const { props } = def2;
    const declaredPropKeys = isArray(props) ? props : Object.keys(props || {});
    for (const key of Object.keys(this)) if (key[0] !== "_" && declaredPropKeys.includes(key)) this._setProp(key, this[key]);
    for (const key of declaredPropKeys.map(camelize)) Object.defineProperty(this, key, {
      get() {
        return this._getProp(key);
      },
      set(val) {
        this._setProp(key, val, true, !this._patching);
      }
    });
  }
  _setAttr(key) {
    if (key.startsWith("data-v-")) return;
    const has = this.hasAttribute(key);
    let value = has ? this.getAttribute(key) : REMOVAL;
    const camelKey = camelize(key);
    if (has && this._numberProps && this._numberProps[camelKey]) value = toNumber(value);
    this._setProp(camelKey, value, false, true);
  }
  /**
  * @internal
  */
  _getProp(key) {
    return this._props[key];
  }
  /**
  * @internal
  */
  _setProp(key, val, shouldReflect = true, shouldUpdate = false) {
    if (val !== this._props[key]) {
      this._dirty = true;
      if (val === REMOVAL) delete this._props[key];
      else {
        this._props[key] = val;
        if (key === "key" && this._app && this._app._ceVNode) this._app._ceVNode.key = val;
      }
      if (shouldUpdate && this._instance) this._update();
      if (shouldReflect) {
        const ob = this._ob;
        if (ob) {
          this._processMutations(ob.takeRecords());
          ob.disconnect();
        }
        if (val === true) this.setAttribute(hyphenate(key), "");
        else if (typeof val === "string" || typeof val === "number") this.setAttribute(hyphenate(key), val + "");
        else if (!val) this.removeAttribute(hyphenate(key));
        ob && ob.observe(this, { attributes: true });
      }
    }
  }
  _applyStyles(styles, owner) {
    if (!styles) return;
    if (owner) {
      if (owner === this._def || this._styleChildren.has(owner)) return;
      this._styleChildren.add(owner);
    }
    const nonce = this._nonce;
    for (let i = styles.length - 1; i >= 0; i--) {
      const s = document.createElement("style");
      if (nonce) s.setAttribute("nonce", nonce);
      s.textContent = styles[i];
      this.shadowRoot.prepend(s);
      if (true) if (owner) {
        if (owner.__hmrId) {
          if (!this._childStyles) this._childStyles = /* @__PURE__ */ new Map();
          let entry = this._childStyles.get(owner.__hmrId);
          if (!entry) this._childStyles.set(owner.__hmrId, entry = []);
          entry.push(s);
        }
      } else (this._styles || (this._styles = [])).push(s);
    }
  }
  /**
  * Only called when shadowRoot is false
  */
  _parseSlots() {
    const slots = this._slots = {};
    let n;
    while (n = this.firstChild) {
      const slotName = n.nodeType === 1 && n.getAttribute("slot") || "default";
      (slots[slotName] || (slots[slotName] = [])).push(n);
      this.removeChild(n);
    }
  }
  /**
  * Only called when shadowRoot is false
  */
  _renderSlots() {
    const outlets = this._getSlots();
    const scopeId = this._instance.type.__scopeId;
    const slotReplacements = /* @__PURE__ */ new Map();
    for (let i = 0; i < outlets.length; i++) {
      const o = outlets[i];
      const slotName = o.getAttribute("name") || "default";
      const content = this._slots[slotName];
      const parent = o.parentNode;
      const replacementNodes = [];
      if (content) for (const n of content) {
        if (scopeId && n.nodeType === 1) {
          const id = scopeId + "-s";
          const walker = document.createTreeWalker(n, 1);
          n.setAttribute(id, "");
          let child2;
          while (child2 = walker.nextNode()) child2.setAttribute(id, "");
        }
        parent.insertBefore(n, o);
        replacementNodes.push(n);
      }
      else while (o.firstChild) {
        const child2 = o.firstChild;
        parent.insertBefore(child2, o);
        replacementNodes.push(child2);
      }
      parent.removeChild(o);
      slotReplacements.set(o, replacementNodes);
    }
    this._updateSlotNodes(slotReplacements);
  }
  /**
  * @internal
  */
  _getSlots() {
    const roots = [this];
    if (this._teleportTargets) roots.push(...this._teleportTargets);
    const slots = /* @__PURE__ */ new Set();
    for (const root of roots) {
      const found = root.querySelectorAll("slot");
      for (let i = 0; i < found.length; i++) slots.add(found[i]);
    }
    return Array.from(slots);
  }
  /**
  * @internal
  */
  _injectChildStyle(comp) {
    this._applyStyles(comp.styles, comp);
  }
  /**
  * @internal
  */
  _beginPatch() {
    this._patching = true;
    this._dirty = false;
  }
  /**
  * @internal
  */
  _endPatch() {
    this._patching = false;
    if (this._dirty && this._instance) this._update();
  }
  /**
  * @internal
  */
  _hasShadowRoot() {
    return this._def.shadowRoot !== false;
  }
  /**
  * @internal
  */
  _removeChildStyle(comp) {
    if (true) {
      this._styleChildren.delete(comp);
      if (this._childStyles && comp.__hmrId) {
        const oldStyles = this._childStyles.get(comp.__hmrId);
        if (oldStyles) {
          oldStyles.forEach((s) => this._root.removeChild(s));
          oldStyles.length = 0;
        }
      }
    }
  }
};
var VueElement = class extends VueElementBase {
  constructor(def2, props = {}, createAppFn = createApp) {
    super(def2, props, createAppFn);
  }
  _needsHydration() {
    if (this.shadowRoot && this._createApp !== createApp) return true;
    else if (this.shadowRoot) warn2("Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineSSRCustomElement`.");
    return false;
  }
  _mount(def2) {
    if (!def2.name) def2.name = "VueElement";
    this._app = this._createApp(def2);
    this._inheritParentContext();
    if (def2.configureApp) def2.configureApp(this._app);
    this._app._ceVNode = this._createVNode();
    this._app.mount(this._root);
  }
  _update() {
    if (!this._app) return;
    const vnode = this._createVNode();
    vnode.appContext = this._app._context;
    render(vnode, this._root);
  }
  _unmount() {
    if (this._app) this._app.unmount();
    if (this._instance && this._instance.ce) this._instance.ce = void 0;
    this._app = this._instance = null;
  }
  /**
  * Only called when shadowRoot is false
  */
  _updateSlotNodes(replacements) {
  }
  _createVNode() {
    const baseProps = {};
    if (!this.shadowRoot) baseProps.onVnodeMounted = baseProps.onVnodeUpdated = this._renderSlots.bind(this);
    const vnode = createVNode(this._def, extend(baseProps, this._props));
    if (!this._instance) vnode.ce = (instance) => {
      this._instance = instance;
      this._processInstance();
    };
    return vnode;
  }
};
function useHost(caller) {
  const { hasInstance, value } = useInstanceOption("ce", true);
  const el = value;
  if (el) return el;
  else if (true) if (!hasInstance) warn2(`${caller || "useHost"} called without an active component instance.`);
  else warn2(`${caller || "useHost"} can only be used in components defined via defineCustomElement.`);
  return null;
}
function useShadowRoot() {
  const el = true ? useHost("useShadowRoot") : useHost();
  return el && el.shadowRoot;
}
function useCssModule(name = "$style") {
  {
    const { hasInstance, value: type } = useInstanceOption("type", true);
    if (!hasInstance) {
      warn2(`useCssModule must be called inside setup()`);
      return EMPTY_OBJ;
    }
    const modules = type.__cssModules;
    if (!modules) {
      warn2(`Current instance does not have CSS modules injected.`);
      return EMPTY_OBJ;
    }
    const mod = modules[name];
    if (!mod) {
      warn2(`Current instance does not have CSS module named "${name}".`);
      return EMPTY_OBJ;
    }
    return mod;
  }
}
var positionMap = /* @__PURE__ */ new WeakMap();
var newPositionMap = /* @__PURE__ */ new WeakMap();
var moveCbKey = /* @__PURE__ */ Symbol("_moveCb");
var enterCbKey2 = /* @__PURE__ */ Symbol("_enterCb");
var decorate = (t2) => {
  delete t2.props.mode;
  return t2;
};
var TransitionGroupImpl = decorate({
  name: "TransitionGroup",
  props: extend({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevChildren;
    let children;
    onUpdated(() => {
      if (!prevChildren.length) return;
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
        prevChildren = [];
        return;
      }
      prevChildren.forEach((vnode) => callPendingCbs(vnode.el));
      prevChildren.forEach(recordPosition);
      const movedChildren = prevChildren.filter(applyTranslation);
      forceReflow(instance.vnode.el);
      movedChildren.forEach((c) => {
        const el = c.el;
        handleMovedChildren(el, moveClass);
      });
      prevChildren = [];
    });
    return () => {
      const rawProps = toRaw(props);
      const cssTransitionProps = resolveTransitionProps(rawProps);
      let tag = rawProps.tag || Fragment;
      prevChildren = [];
      if (children) for (let i = 0; i < children.length; i++) {
        const child2 = children[i];
        if (child2.el && child2.el instanceof Element) {
          prevChildren.push(child2);
          setTransitionHooks(child2, resolveTransitionHooks(child2, cssTransitionProps, state, instance));
          positionMap.set(child2, getPosition(child2.el));
        }
      }
      children = slots.default ? getTransitionRawChildren(slots.default()) : [];
      for (let i = 0; i < children.length; i++) {
        const child2 = children[i];
        if (child2.key != null) setTransitionHooks(child2, resolveTransitionHooks(child2, cssTransitionProps, state, instance));
        else if (child2.type !== Text2) warn2(`<TransitionGroup> children must be keyed.`);
      }
      return createVNode(tag, null, children);
    };
  }
});
var TransitionGroup = TransitionGroupImpl;
function callPendingCbs(el) {
  if (el[moveCbKey]) el[moveCbKey]();
  if (el[enterCbKey2]) el[enterCbKey2]();
}
function recordPosition(c) {
  newPositionMap.set(c, getPosition(c.el));
}
function applyTranslation(c) {
  if (baseApplyTranslation(positionMap.get(c), newPositionMap.get(c), c.el)) return c;
}
function baseApplyTranslation(oldPos, newPos, el) {
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    const s = el.style;
    const rect = el.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;
    if (el.offsetWidth) scaleX = rect.width / el.offsetWidth;
    if (el.offsetHeight) scaleY = rect.height / el.offsetHeight;
    if (!Number.isFinite(scaleX) || scaleX === 0) scaleX = 1;
    if (!Number.isFinite(scaleY) || scaleY === 0) scaleY = 1;
    if (Math.abs(scaleX - 1) < 0.01) scaleX = 1;
    if (Math.abs(scaleY - 1) < 0.01) scaleY = 1;
    s.transform = s.webkitTransform = `translate(${dx / scaleX}px,${dy / scaleY}px)`;
    s.transitionDuration = "0s";
    return true;
  }
  return false;
}
function getPosition(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top
  };
}
function hasCSSTransform(el, root, moveClass) {
  const clone = el.cloneNode();
  const _vtc = el[vtcKey];
  if (_vtc) _vtc.forEach((cls) => {
    cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
  });
  moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
  clone.style.display = "none";
  const container = root.nodeType === 1 ? root : root.parentNode;
  container.appendChild(clone);
  const { hasTransform } = getTransitionInfo(clone);
  container.removeChild(clone);
  return hasTransform;
}
var handleMovedChildren = (el, moveClass) => {
  const style = el.style;
  addTransitionClass(el, moveClass);
  style.transform = style.webkitTransform = style.transitionDuration = "";
  const cb = el[moveCbKey] = (e) => {
    if (e && e.target !== el) return;
    if (!e || e.propertyName.endsWith("transform")) {
      el.removeEventListener("transitionend", cb);
      el[moveCbKey] = null;
      removeTransitionClass(el, moveClass);
    }
  };
  el.addEventListener("transitionend", cb);
};
var getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
var assignKey = /* @__PURE__ */ Symbol("_assign");
var vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    vModelTextInit(el, trim, number || !!(vnode.props && vnode.props.type === "number"), lazy);
  },
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    vModelTextUpdate(el, oldValue, value, trim, number, lazy);
  }
};
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
var vModelTextInit = (el, trim, number, lazy, set) => {
  addEventListener(el, lazy ? "change" : "input", (e) => {
    if (e.target.composing) return;
    (set || el[assignKey])(castValue(el.value, trim, number || el.type === "number"));
  });
  if (trim || number) addEventListener(el, "change", () => {
    el.value = castValue(el.value, trim, number || el.type === "number");
  });
  if (!lazy) {
    addEventListener(el, "compositionstart", onCompositionStart);
    addEventListener(el, "compositionend", onCompositionEnd);
    addEventListener(el, "change", onCompositionEnd);
  }
};
var vModelTextUpdate = (el, oldValue, value, trim, number, lazy) => {
  if (el.composing) return;
  const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
  const newValue = value == null ? "" : value;
  if (elValue === newValue) return;
  if (document.activeElement === el && el.type !== "range") {
    if (lazy && value === oldValue) return;
    if (trim && el.value.trim() === newValue) return;
  }
  el.value = newValue;
};
var vModelCheckbox = {
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    vModelCheckboxInit(el);
  },
  mounted(el, binding, vnode) {
    vModelCheckboxUpdate(el, binding.oldValue, binding.value, vnode.props.value);
  },
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    vModelCheckboxUpdate(el, binding.oldValue, binding.value, vnode.props.value);
  }
};
var vModelCheckboxInit = (el, set) => {
  addEventListener(el, "change", () => {
    const assign = set || el[assignKey];
    const modelValue = el._modelValue;
    const elementValue = getValue(el);
    const checked = el.checked;
    if (isArray(modelValue)) {
      const index = looseIndexOf(modelValue, elementValue);
      const found = index !== -1;
      if (checked && !found) assign(modelValue.concat(elementValue));
      else if (!checked && found) {
        const filtered = [...modelValue];
        filtered.splice(index, 1);
        assign(filtered);
      }
    } else if (isSet(modelValue)) {
      const cloned = new Set(modelValue);
      if (checked) cloned.add(elementValue);
      else cloned.delete(elementValue);
      assign(cloned);
    } else assign(getCheckboxValue(el, checked));
  });
};
var vModelCheckboxUpdate = (el, oldValue, value, rawValue = getValue(el)) => {
  el._modelValue = value;
  let checked;
  if (isArray(value)) checked = looseIndexOf(value, rawValue) > -1;
  else if (isSet(value)) checked = value.has(rawValue);
  else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) el.checked = checked;
};
var vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el[assignKey](getValue(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (value !== oldValue) el.checked = looseEqual(value, vnode.props.value);
  }
};
var vModelSelect = {
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    vModelSelectInit(el, value, number);
    el[assignKey] = getModelAssigner(vnode);
  },
  mounted(el, { value }) {
    vModelSetSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    vModelSetSelected(el, value);
  }
};
var vModelSelectInit = (el, value, number, set) => {
  const isSetModel = isSet(value);
  addEventListener(el, "change", () => {
    const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? looseToNumber(getValue(o)) : getValue(o));
    (set || el[assignKey])(el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
    el._assigning = true;
    nextTick(() => {
      el._assigning = false;
    });
  });
};
var vModelSetSelected = (el, value) => {
  if (el._assigning) return;
  const isMultiple = el.multiple;
  const isArrayValue = isArray(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    warn2(`<select multiple v-model> expects an Array or Set value for its binding, but got ${Object.prototype.toString.call(value).slice(8, -1)}.`);
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) if (isArrayValue) {
      const optionType = typeof optionValue;
      if (optionType === "string" || optionType === "number") option.selected = value.some((v) => String(v) === String(optionValue));
      else option.selected = looseIndexOf(value, optionValue) > -1;
    } else option.selected = value.has(optionValue);
    else if (looseEqual(getValue(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) el.selectedIndex = -1;
};
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  if (key in el) return el[key];
  const attr = checked ? "true-value" : "false-value";
  if (el.hasAttribute(attr)) return el.getAttribute(attr);
  return checked;
}
var vModelDynamic = {
  created(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "created");
  },
  mounted(el, binding, vnode) {
    callModelHook(el, binding, vnode, null, "mounted");
  },
  beforeUpdate(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "beforeUpdate");
  },
  updated(el, binding, vnode, prevVNode) {
    callModelHook(el, binding, vnode, prevVNode, "updated");
  }
};
function resolveDynamicModel(tagName, type) {
  switch (tagName) {
    case "SELECT":
      return vModelSelect;
    case "TEXTAREA":
      return vModelText;
    default:
      switch (type) {
        case "checkbox":
          return vModelCheckbox;
        case "radio":
          return vModelRadio;
        default:
          return vModelText;
      }
  }
}
function callModelHook(el, binding, vnode, prevVNode, hook) {
  const fn = resolveDynamicModel(el.tagName, vnode.props && vnode.props.type)[hook];
  fn && fn(el, binding, vnode, prevVNode);
}
function initVModelForSSR() {
  vModelText.getSSRProps = ({ value }) => ({ value });
  vModelRadio.getSSRProps = ({ value }, vnode) => {
    if (vnode.props && looseEqual(vnode.props.value, value)) return { checked: true };
  };
  vModelCheckbox.getSSRProps = ({ value }, vnode) => {
    if (isArray(value)) {
      if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) return { checked: true };
    } else if (isSet(value)) {
      if (vnode.props && value.has(vnode.props.value)) return { checked: true };
    } else if (value) return { checked: true };
  };
  vModelDynamic.getSSRProps = (binding, vnode) => {
    if (typeof vnode.type !== "string") return;
    const modelToUse = resolveDynamicModel(vnode.type.toUpperCase(), vnode.props && vnode.props.type);
    if (modelToUse.getSSRProps) return modelToUse.getSSRProps(binding, vnode);
  };
}
var systemModifiers = [
  "ctrl",
  "shift",
  "alt",
  "meta"
];
var modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
var withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  }));
};
var keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
var withKeys = (fn, modifiers) => {
  const cache = fn._withKeys || (fn._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event) => {
    if (!("key" in event)) return;
    const eventKey = hyphenate(event.key);
    if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) return fn(event);
  }));
};
var rendererOptions = extend({ patchProp }, nodeOps);
var renderer;
var enabledHydration = false;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
function ensureHydrationRenderer() {
  renderer = enabledHydration ? renderer : createHydrationRenderer(rendererOptions);
  enabledHydration = true;
  return renderer;
}
var render = ((...args) => {
  ensureRenderer().render(...args);
});
var hydrate = ((...args) => {
  ensureHydrationRenderer().hydrate(...args);
});
var createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  if (true) {
    injectNativeTagCheck(app);
    injectCompilerOptionsCheck(app);
  }
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
    if (container.nodeType === 1) container.textContent = "";
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
var createSSRApp = ((...args) => {
  setIsHydratingEnabled(true);
  const app = ensureHydrationRenderer().createApp(...args);
  if (true) {
    injectNativeTagCheck(app);
    injectCompilerOptionsCheck(app);
  }
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (container) return mount(container, true, resolveRootNamespace(container));
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) return "svg";
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
}
function injectNativeTagCheck(app) {
  Object.defineProperty(app.config, "isNativeTag", {
    value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
    writable: false
  });
}
function injectCompilerOptionsCheck(app) {
  if (isRuntimeOnly()) {
    const isCustomElement = app.config.isCustomElement;
    Object.defineProperty(app.config, "isCustomElement", {
      get() {
        return isCustomElement;
      },
      set() {
        warn2("The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead.");
      }
    });
    const compilerOptions = app.config.compilerOptions;
    const msg = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
    Object.defineProperty(app.config, "compilerOptions", {
      get() {
        warn2(msg);
        return compilerOptions;
      },
      set() {
        warn2(msg);
      }
    });
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    if (!res) warn2(`Failed to mount app: mount target selector "${container}" returned null.`);
    return res;
  }
  if (window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") warn2(`mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`);
  return container;
}
var ssrDirectiveInitialized = false;
var initDirectivesForSSR = () => {
  if (!ssrDirectiveInitialized) {
    ssrDirectiveInitialized = true;
    initVModelForSSR();
    initVShowForSSR();
  }
};

// node_modules/.pnpm/@vue+runtime-vapor@3.6.0-beta.7_@vue+runtime-dom@3.6.0-beta.7/node_modules/@vue/runtime-vapor/dist/runtime-vapor.esm-bundler.js
var insertionParent;
var insertionAnchor;
var insertionIndex;
var isLastInsertion;
function setInsertionState(parent, anchor, logicalIndex, last) {
  insertionParent = parent;
  isLastInsertion = last;
  insertionIndex = logicalIndex;
  if (anchor !== void 0) if (isHydrating$1) insertionAnchor = void 0;
  else {
    insertionAnchor = anchor;
    if (anchor === 0 && !parent.$fc) parent.$fc = parent.firstChild;
  }
  else insertionAnchor = void 0;
}
function resetInsertionState() {
  insertionParent = insertionAnchor = insertionIndex = isLastInsertion = void 0;
}
var isHydratingEnabled2 = false;
function setIsHydratingEnabled2(value) {
  isHydratingEnabled2 = value;
}
var currentHydrationNode = null;
var isHydrating$1 = false;
function setIsHydrating(value) {
  if (!isHydratingEnabled2) return false;
  try {
    return isHydrating$1;
  } finally {
    isHydrating$1 = value;
  }
}
function runWithoutHydration(fn) {
  const prev = setIsHydrating(false);
  try {
    return fn();
  } finally {
    setIsHydrating(prev);
  }
}
var isOptimized$1 = false;
function performHydration(fn, setup, cleanup2) {
  if (!isOptimized$1) {
    adoptTemplate = adoptTemplateImpl;
    locateHydrationNode = locateHydrationNodeImpl;
    Comment.prototype.$fe = void 0;
    Node.prototype.$idx = void 0;
    Node.prototype.$llc = void 0;
    isOptimized$1 = true;
  }
  enableHydrationNodeLookup();
  const prev = setIsHydrating(true);
  setup();
  const res = fn();
  cleanup2();
  currentHydrationNode = null;
  setIsHydrating(prev);
  if (!isHydrating$1) disableHydrationNodeLookup();
  return res;
}
function withHydration(container, fn) {
  const setup = () => setInsertionState(container);
  const cleanup2 = () => resetInsertionState();
  return performHydration(fn, setup, cleanup2);
}
function hydrateNode(node, fn) {
  const setup = () => currentHydrationNode = node;
  const cleanup2 = () => {
  };
  return performHydration(fn, setup, cleanup2);
}
var adoptTemplate;
var locateHydrationNode;
var isComment2 = (node, data) => node.nodeType === 8 && node.data === data;
function setCurrentHydrationNode(node) {
  currentHydrationNode = node;
}
function locateNextSiblingOfParent(n) {
  if (!n.parentNode) return null;
  return n.parentNode.nextSibling || locateNextSiblingOfParent(n.parentNode);
}
function advanceHydrationNode(node) {
  const ret = node.nextSibling || locateNextSiblingOfParent(node);
  if (ret) setCurrentHydrationNode(ret);
}
function adoptTemplateImpl(node, template2) {
  if (!(template2[0] === "<" && template2[1] === "!")) while (node.nodeType === 8) {
    node = node.nextSibling;
    if (template2.trim() === "" && isComment2(node, "]") && isComment2(node.previousSibling, "[")) {
      node.before(node = createTextNode());
      break;
    }
  }
  const type = node.nodeType;
  if (type === 8 && !template2.startsWith("<!") || type === 1 && !template2.startsWith(`<` + node.tagName.toLowerCase())) node = handleMismatch(node, template2);
  currentHydrationNode = node.nextSibling;
  return node;
}
function locateNextNode(node) {
  return isComment2(node, "[") ? _next(locateEndAnchor(node)) : isComment2(node, "teleport start") ? _next(locateEndAnchor(node, "teleport start", "teleport end")) : _next(node);
}
function locateHydrationNodeImpl() {
  let node;
  if (insertionIndex !== void 0) node = locateChildByLogicalIndex(insertionParent, insertionIndex);
  else if (insertionParent) node = insertionParent.firstChild;
  else node = currentHydrationNode;
  if (!node) throw new Error("No current hydration node was found.\nthis is likely a Vue internal bug.");
  resetInsertionState();
  currentHydrationNode = node;
}
function locateEndAnchor(node, open = "[", close = "]") {
  if (node.$fe) return node.$fe;
  const stack2 = [node];
  while ((node = node.nextSibling) && stack2.length > 0) if (node.nodeType === 8) {
    if (node.data === open) stack2.push(node);
    else if (node.data === close) {
      const matchingOpen = stack2.pop();
      matchingOpen.$fe = node;
      if (stack2.length === 0) return node;
    }
  }
  return null;
}
function locateFragmentEndAnchor(label = "]") {
  let node = currentHydrationNode;
  while (node) {
    if (isComment2(node, label)) return node;
    node = node.nextSibling;
  }
  return null;
}
function handleMismatch(node, template2) {
  if (!isMismatchAllowed(node.parentElement, 1)) {
    warn2(`Hydration node mismatch:
- rendered on server:`, node, node.nodeType === 3 ? `(text)` : isComment2(node, "[[") ? `(start of block node)` : ``, `
- expected on client:`, template2);
    logMismatchError2();
  }
  if (isComment2(node, "[")) removeFragmentNodes(node);
  const next2 = _next(node);
  const container = parentNode(node);
  remove2(node, container);
  if (template2[0] !== "<") return container.insertBefore(createTextNode(template2), next2);
  const t2 = createElement("template");
  t2.innerHTML = template2;
  const newNode = _child(t2.content).cloneNode(true);
  newNode.innerHTML = node.innerHTML;
  Array.from(node.attributes).forEach((attr) => {
    newNode.setAttribute(attr.name, attr.value);
  });
  container.insertBefore(newNode, next2);
  return newNode;
}
var hasLoggedMismatchError2 = false;
var logMismatchError2 = () => {
  if (hasLoggedMismatchError2) return;
  console.error("Hydration completed but contains mismatches.");
  hasLoggedMismatchError2 = true;
};
function removeFragmentNodes(node, endAnchor) {
  const end = endAnchor || locateEndAnchor(node);
  while (true) {
    const next2 = _next(node);
    if (next2 && next2 !== end) remove2(next2, parentNode(node));
    else break;
  }
}
function createElement(tagName) {
  return document.createElement(tagName);
}
function createTextNode(value = "") {
  return document.createTextNode(value);
}
function createComment(data) {
  return document.createComment(data);
}
function querySelector(selectors) {
  return document.querySelector(selectors);
}
function parentNode(node) {
  return node.parentNode;
}
var _txt = _child;
var __txt = (node) => {
  let n = node.firstChild;
  if (!n) return node.appendChild(createTextNode());
  return n;
};
function _child(node) {
  return node.firstChild;
}
function __child(node, logicalIndex = 0) {
  return locateChildByLogicalIndex(node, logicalIndex);
}
function _nthChild(node, i) {
  return node.childNodes[i];
}
function __nthChild(node, logicalIndex) {
  return locateChildByLogicalIndex(node, logicalIndex);
}
function _next(node) {
  return node.nextSibling;
}
function __next(node, logicalIndex) {
  return locateChildByLogicalIndex(node.parentNode, logicalIndex);
}
var txt = (...args) => {
  return txt.impl(...args);
};
txt.impl = _txt;
var child = (...args) => {
  return child.impl(...args);
};
child.impl = _child;
var next = (...args) => {
  return next.impl(...args);
};
next.impl = _next;
var nthChild = (...args) => {
  return nthChild.impl(...args);
};
nthChild.impl = _nthChild;
function enableHydrationNodeLookup() {
  txt.impl = __txt;
  child.impl = __child;
  next.impl = __next;
  nthChild.impl = __nthChild;
}
function disableHydrationNodeLookup() {
  txt.impl = _txt;
  child.impl = _child;
  next.impl = _next;
  nthChild.impl = _nthChild;
}
function locateChildByLogicalIndex(parent, logicalIndex) {
  let child2 = parent.$llc || parent.firstChild;
  let fromIndex = child2.$idx || 0;
  if (logicalIndex < fromIndex) {
    child2 = parent.firstChild;
    fromIndex = 0;
  }
  while (child2) {
    if (fromIndex === logicalIndex) {
      child2.$idx = logicalIndex;
      return parent.$llc = child2;
    }
    child2 = isComment2(child2, "[") ? locateEndAnchor(child2).nextSibling : child2.nextSibling;
    fromIndex++;
  }
  return null;
}
function addEventListener2(el, event, handler, options) {
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}
function on(el, event, handler, options = {}) {
  if (isArray(handler)) handler.forEach((fn) => on(el, event, fn, options));
  else {
    if (!handler) return;
    addEventListener2(el, event, handler, options);
    if (options.effect) onEffectCleanup(() => {
      el.removeEventListener(event, handler, options);
    });
  }
}
function delegate(el, event, handler) {
  const key = `$evt${event}`;
  const existing = el[key];
  if (existing) if (isArray(existing)) existing.push(handler);
  else el[key] = [existing, handler];
  else el[key] = handler;
}
var delegatedEvents = /* @__PURE__ */ Object.create(null);
var delegateEvents = (...names) => {
  for (const name of names) if (!delegatedEvents[name]) {
    delegatedEvents[name] = true;
    document.addEventListener(name, delegatedEventHandler);
  }
};
var delegatedEventHandler = (e) => {
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) Object.defineProperty(e, "target", {
    configurable: true,
    value: node
  });
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  while (node !== null) {
    const handlers = node[`$evt${e.type}`];
    if (handlers) if (isArray(handlers)) {
      for (const handler of handlers) if (!node.disabled) {
        handler(e);
        if (e.cancelBubble) return;
      }
    } else {
      handlers(e);
      if (e.cancelBubble) return;
    }
    node = node.host && node.host !== node && node.host instanceof Node ? node.host : node.parentNode;
  }
};
function setDynamicEvents(el, events) {
  for (const name in events) on(el, name, events[name], { effect: true });
}
function createInvoker2(handler) {
  const i = currentInstance;
  return (...args) => callWithAsyncErrorHandling(handler, i, 5, args);
}
var hasFallthroughKey = (key) => currentInstance.hasFallthrough && key in currentInstance.attrs;
function setProp(el, key, value) {
  if (key in el) setDOMProp(el, key, value);
  else setAttr(el, key, value);
}
function setAttr(el, key, value, isSVG = false) {
  if (!isApplyingFallthroughProps && el.$root && hasFallthroughKey(key)) return;
  if (key === "true-value") el._trueValue = value;
  else if (key === "false-value") el._falseValue = value;
  if (isHydrating$1 && !attributeHasMismatch(el, key, value)) {
    el[`$${key}`] = value;
    return;
  }
  if (value !== el[`$${key}`]) {
    el[`$${key}`] = value;
    if (isSVG && key.startsWith("xlink:")) if (value != null) el.setAttributeNS(xlinkNS, key, value);
    else el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    else if (value != null) el.setAttribute(key, value);
    else el.removeAttribute(key);
  }
}
function setDOMProp(el, key, value, forceHydrate = false, attrName) {
  if (!isApplyingFallthroughProps && el.$root && hasFallthroughKey(key)) return;
  if (isHydrating$1 && !attributeHasMismatch(el, key, value) && !shouldForceHydrate(el, key) && !forceHydrate) return;
  const prev = el[key];
  if (value === prev) return;
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof prev;
    if (type === "boolean") value = includeBooleanAttr(value);
    else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
    if (!needRemove) warn2(`Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: value ${value} is invalid.`, e);
  }
  needRemove && el.removeAttribute(attrName || key);
}
function setClass(el, value, isSVG = false) {
  if (el.$root) setClassIncremental(el, value);
  else {
    value = normalizeClass(value);
    if (isHydrating$1 && !classHasMismatch(el, value, false)) {
      el.$cls = value;
      return;
    }
    if (value !== el.$cls) if (isSVG) el.setAttribute("class", el.$cls = value);
    else el.className = el.$cls = value;
  }
}
function setClassIncremental(el, value) {
  const cacheKey = `$clsi${isApplyingFallthroughProps ? "$" : ""}`;
  const normalizedValue = normalizeClass(value);
  if (isHydrating$1 && !classHasMismatch(el, normalizedValue, true)) {
    el[cacheKey] = normalizedValue;
    return;
  }
  const prev = el[cacheKey];
  if ((value = el[cacheKey] = normalizedValue) !== prev) {
    const nextList = value.split(/\s+/);
    if (value) el.classList.add(...nextList);
    if (prev) {
      for (const cls of prev.split(/\s+/)) if (!nextList.includes(cls)) el.classList.remove(cls);
    }
  }
}
function shouldDeferCheckStyleMismatch(el) {
  return !!currentInstance.getCssVars || Object.values(el.style).some((v) => v.startsWith("--"));
}
function setStyle2(el, value) {
  if (el.$root) setStyleIncremental(el, value);
  else {
    const normalizedValue = normalizeStyle(value);
    if (isHydrating$1) {
      if (shouldDeferCheckStyleMismatch(el)) {
        const instance = currentInstance;
        queuePostFlushCb(() => {
          if (!styleHasMismatch(el, value, normalizedValue, false, instance)) {
            el.$sty = normalizedValue;
            return;
          }
          patchStyle(el, el.$sty, el.$sty = normalizedValue);
        });
        return;
      } else if (!styleHasMismatch(el, value, normalizedValue, false)) {
        el.$sty = normalizedValue;
        return;
      }
    }
    patchStyle(el, el.$sty, el.$sty = normalizedValue);
  }
}
function setStyleIncremental(el, value) {
  const cacheKey = `$styi${isApplyingFallthroughProps ? "$" : ""}`;
  const normalizedValue = isString(value) ? parseStringStyle(value) : normalizeStyle(value);
  if (isHydrating$1) {
    if (shouldDeferCheckStyleMismatch(el)) {
      const instance = currentInstance;
      queuePostFlushCb(() => {
        if (!styleHasMismatch(el, value, normalizedValue, true, instance)) {
          el[cacheKey] = normalizedValue;
          return;
        }
        patchStyle(el, el[cacheKey], el[cacheKey] = normalizedValue);
      });
      return;
    } else if (!styleHasMismatch(el, value, normalizedValue, true)) {
      el[cacheKey] = normalizedValue;
      return;
    }
  }
  patchStyle(el, el[cacheKey], el[cacheKey] = normalizedValue);
}
function setValue(el, value, forceHydrate = false) {
  if (!isApplyingFallthroughProps && el.$root && hasFallthroughKey("value")) return;
  el._value = value;
  if (isHydrating$1 && !attributeHasMismatch(el, "value", getClientText(el, value)) && !shouldForceHydrate(el, "value") && !forceHydrate) return;
  const oldValue = el.tagName === "OPTION" ? el.getAttribute("value") : el.value;
  const newValue = value == null ? "" : value;
  if (oldValue !== newValue) el.value = newValue;
  if (value == null) el.removeAttribute("value");
}
function setText(el, value) {
  if (isHydrating$1) {
    const clientText = getClientText(el.parentNode, value);
    if (el.nodeValue == clientText) {
      el.$txt = clientText;
      return;
    }
    warn2(`Hydration text mismatch in`, el.parentNode, `
  - rendered on server: ${JSON.stringify(el.data)}
  - expected on client: ${JSON.stringify(value)}`);
    logMismatchError2();
  }
  if (el.$txt !== value) el.nodeValue = el.$txt = value;
}
function setElementText(el, value) {
  value = toDisplayString(value);
  if (isHydrating$1) {
    let clientText = getClientText(el, value);
    if (el.textContent === clientText) {
      el.$txt = clientText;
      return;
    }
    if (!isMismatchAllowed(el, 0)) {
      warn2(`Hydration text content mismatch on`, el, `
  - rendered on server: ${el.textContent}
  - expected on client: ${clientText}`);
      logMismatchError2();
    }
  }
  if (el.$txt !== value) el.textContent = el.$txt = value;
}
function setBlockText(block, value) {
  value = value == null ? "" : value;
  if (block.$txt !== value) setTextToBlock(block, block.$txt = value);
}
function warnCannotSetProp(prop) {
  warn2(`Extraneous non-props attributes (${prop}) were passed to component but could not be automatically inherited because component renders text or multiple root nodes.`);
}
function setTextToBlock(block, value) {
  if (block instanceof Node) {
    if (block instanceof Element) block.textContent = value;
    else if (true) warnCannotSetProp("textContent");
  } else if (isVaporComponent2(block)) setTextToBlock(block.block, value);
  else if (isArray(block)) {
    if (true) warnCannotSetProp("textContent");
  } else setTextToBlock(block.nodes, value);
}
function setHtml(el, value) {
  value = value == null ? "" : unsafeToTrustedHTML(value);
  if (el.$html !== value) el.innerHTML = el.$html = value;
}
function setBlockHtml(block, value) {
  value = value == null ? "" : unsafeToTrustedHTML(value);
  if (block.$html !== value) setHtmlToBlock(block, block.$html = value);
}
function setHtmlToBlock(block, value) {
  if (block instanceof Node) {
    if (block instanceof Element) block.innerHTML = value;
    else if (true) warnCannotSetProp("innerHTML");
  } else if (isVaporComponent2(block)) setHtmlToBlock(block.block, value);
  else if (isArray(block)) {
    if (true) warnCannotSetProp("innerHTML");
  } else setHtmlToBlock(block.nodes, value);
}
function setDynamicProps(el, args, isSVG) {
  const props = args.length > 1 ? mergeProps(...args) : args[0];
  const cacheKey = `$dprops${isApplyingFallthroughProps ? "$" : ""}`;
  const prevKeys = el[cacheKey];
  if (prevKeys) {
    for (const key of prevKeys) if (!(key in props)) setDynamicProp(el, key, null, isSVG);
  }
  for (const key of el[cacheKey] = Object.keys(props)) setDynamicProp(el, key, props[key], isSVG);
}
function setDynamicProp(el, key, value, isSVG = false) {
  let forceHydrate = false;
  if (key === "class") setClass(el, value, isSVG);
  else if (key === "style") setStyle2(el, value);
  else if (isOn(key)) on(el, key[2].toLowerCase() + key.slice(3), value, { effect: true });
  else if ((forceHydrate = key[0] === ".") ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, value, isSVG)) if (key === "innerHTML") setHtml(el, value);
  else if (key === "textContent") setElementText(el, value);
  else if (key === "value" && canSetValueDirectly(el.tagName)) setValue(el, value, forceHydrate);
  else setDOMProp(el, key, value, forceHydrate);
  else if (el._isVueCE && (/[A-Z]/.test(key) || !isString(value))) setDOMProp(el, camelize(key), value, forceHydrate, key);
  else setAttr(el, key, value, isSVG);
  return value;
}
var isOptimized = false;
function optimizePropertyLookup() {
  if (isOptimized) return;
  isOptimized = true;
  const proto = Element.prototype;
  proto.$transition = void 0;
  proto.$key = void 0;
  proto.$fc = proto.$evtclick = void 0;
  proto.$root = false;
  proto.$html = proto.$cls = proto.$sty = "";
  Text.prototype.$txt = void 0;
}
function classHasMismatch(el, expected, isIncremental) {
  const actual = el.getAttribute("class");
  const actualClassSet = toClassSet(actual || "");
  const expectedClassSet = toClassSet(expected);
  let hasMismatch = false;
  if (isIncremental) {
    if (expected) hasMismatch = Array.from(expectedClassSet).some((cls) => !actualClassSet.has(cls));
  } else hasMismatch = !isSetEqual(actualClassSet, expectedClassSet);
  if (hasMismatch) {
    warnPropMismatch(el, "class", 2, actual, expected);
    logMismatchError2();
    return true;
  }
  return false;
}
function styleHasMismatch(el, value, normalizedValue, isIncremental, instance = currentInstance) {
  const actual = el.getAttribute("style");
  const actualStyleMap = toStyleMap(actual || "");
  const expected = isString(value) ? value : stringifyStyle(normalizedValue);
  const expectedStyleMap = toStyleMap(expected);
  if (el[vShowHidden]) expectedStyleMap.set("display", "none");
  if (instance) resolveCssVars2(instance, el, expectedStyleMap);
  let hasMismatch = false;
  if (isIncremental) {
    if (expected) hasMismatch = Array.from(expectedStyleMap.entries()).some(([key, val]) => actualStyleMap.get(key) !== val);
  } else hasMismatch = !isMapEqual(actualStyleMap, expectedStyleMap);
  if (hasMismatch) {
    warnPropMismatch(el, "style", 3, actual, expected);
    logMismatchError2();
    return true;
  }
  return false;
}
function resolveCssVars2(instance, block, expectedMap) {
  if (!instance.isMounted) return;
  const rootBlocks = normalizeBlock(instance);
  if (instance.getCssVars && normalizeBlock(block).every((b) => rootBlocks.includes(b))) {
    const cssVars = instance.getCssVars();
    for (const key in cssVars) {
      const value = normalizeCssVarValue(cssVars[key]);
      expectedMap.set(`--${getEscapedCssVarName(key, false)}`, value);
    }
  }
  if (normalizeBlock(block).every((b) => rootBlocks.includes(b)) && instance.parent) resolveCssVars2(instance.parent, instance.block, expectedMap);
}
function attributeHasMismatch(el, key, value) {
  if (isValidHtmlOrSvgAttribute(el, key)) {
    const { actual, expected } = getAttributeMismatch(el, key, value);
    if (actual !== expected) {
      warnPropMismatch(el, key, 4, actual, expected);
      logMismatchError2();
      return true;
    }
  }
  return false;
}
function getClientText(el, value) {
  if (value[0] === "\n" && (el.tagName === "PRE" || el.tagName === "TEXTAREA")) value = value.slice(1);
  return value;
}
function shouldForceHydrate(el, key) {
  const { tagName } = el;
  return (tagName === "INPUT" || tagName === "OPTION") && (key.endsWith("value") || key === "indeterminate") || tagName.includes("-");
}
var displayName = "VaporTransition";
var registered = false;
var ensureTransitionHooksRegistered = () => {
  if (!registered) {
    registered = true;
    registerTransitionHooks(applyTransitionHooksImpl, applyTransitionLeaveHooksImpl);
  }
};
var hydrateTransitionImpl = () => {
  if (!currentHydrationNode || !isTemplateNode(currentHydrationNode)) return;
  const { content: { firstChild }, parentNode: parentNode2 } = currentHydrationNode;
  if (firstChild) {
    parentNode2.replaceChild(firstChild, currentHydrationNode);
    setCurrentHydrationNode(firstChild);
    if (firstChild instanceof HTMLElement || firstChild instanceof SVGElement) {
      const originalDisplay = firstChild.style.display;
      firstChild.style.display = "none";
      return (hooks) => {
        hooks.beforeEnter(firstChild);
        firstChild.style.display = originalDisplay;
        queuePostFlushCb(() => hooks.enter(firstChild));
      };
    }
  }
};
var decorate$12 = (t2) => {
  t2.displayName = displayName;
  t2.props = TransitionPropsValidators;
  t2.__vapor = true;
  return t2;
};
var VaporTransition = decorate$12((props, { slots, expose: expose2 }) => {
  expose2();
  ensureTransitionHooksRegistered();
  const performAppear = isHydrating$1 ? hydrateTransitionImpl() : void 0;
  const children = slots.default && slots.default();
  if (!children) return [];
  const instance = currentInstance;
  const { mode } = props;
  checkTransitionMode(mode);
  let resolvedProps;
  renderEffect(() => resolvedProps = resolveTransitionProps(props));
  const hooks = applyTransitionHooksImpl(children, {
    state: useTransitionState(),
    props: new Proxy({}, { get(_, key) {
      return resolvedProps[key];
    } }),
    instance
  });
  if (resolvedProps.appear && performAppear) performAppear(hooks);
  return children;
});
var getTransitionHooksContext = (key, props, state, instance, postClone) => {
  const { leavingNodes } = state;
  return {
    isLeaving: () => leavingNodes.has(key),
    setLeavingNodeCache: (el) => {
      leavingNodes.set(key, el);
    },
    unsetLeavingNodeCache: (el) => {
      if (leavingNodes.get(key) === el) leavingNodes.delete(key);
    },
    earlyRemove: () => {
      const leavingNode = leavingNodes.get(key);
      if (leavingNode && leavingNode[leaveCbKey]) leavingNode[leaveCbKey]();
    },
    cloneHooks: (block) => {
      const hooks = resolveTransitionHooks2(block, props, state, instance, postClone);
      if (postClone) postClone(hooks);
      return hooks;
    }
  };
};
function resolveTransitionHooks2(block, props, state, instance, postClone) {
  const hooks = baseResolveTransitionHooks(getTransitionHooksContext(String(block.$key), props, state, instance, postClone), props, state, instance);
  hooks.state = state;
  hooks.props = props;
  hooks.instance = instance;
  return hooks;
}
function applyTransitionHooksImpl(block, hooks) {
  if (isArray(block)) {
    block = block.filter((b) => !(b instanceof Comment));
    if (block.length === 1) block = block[0];
    else if (block.length === 0) return hooks;
  }
  const fragments = [];
  const child2 = findTransitionBlock(block, (frag) => fragments.push(frag));
  if (!child2) {
    fragments.forEach((f) => f.$transition = hooks);
    if (fragments.length === 0) warn2("Transition component has no valid child element");
    return hooks;
  }
  const { props, instance, state, delayedLeave } = hooks;
  let resolvedHooks = resolveTransitionHooks2(child2, props, state, instance, (hooks2) => resolvedHooks = hooks2);
  resolvedHooks.delayedLeave = delayedLeave;
  child2.$transition = resolvedHooks;
  fragments.forEach((f) => f.$transition = resolvedHooks);
  return resolvedHooks;
}
function applyTransitionLeaveHooksImpl(block, enterHooks, afterLeaveCb) {
  const leavingBlock = findTransitionBlock(block);
  if (!leavingBlock) return void 0;
  const { props, state, instance } = enterHooks;
  const leavingHooks = resolveTransitionHooks2(leavingBlock, props, state, instance);
  leavingBlock.$transition = leavingHooks;
  const { mode } = props;
  if (mode === "out-in") {
    state.isLeaving = true;
    leavingHooks.afterLeave = () => {
      state.isLeaving = false;
      afterLeaveCb();
      leavingBlock.$transition = void 0;
      delete leavingHooks.afterLeave;
    };
  } else if (mode === "in-out") leavingHooks.delayLeave = (block2, earlyRemove, delayedLeave) => {
    state.leavingNodes.set(String(leavingBlock.$key), leavingBlock);
    block2[leaveCbKey] = () => {
      earlyRemove();
      block2[leaveCbKey] = void 0;
      leavingBlock.$transition = void 0;
      delete enterHooks.delayedLeave;
    };
    enterHooks.delayedLeave = () => {
      delayedLeave();
      leavingBlock.$transition = void 0;
      delete enterHooks.delayedLeave;
    };
  };
}
function findTransitionBlock(block, onFragment) {
  let child2;
  if (block instanceof Node) {
    if (block instanceof Element) child2 = block;
  } else if (isVaporComponent2(block)) if (isAsyncWrapper(block)) if (!block.type.__asyncResolved) onFragment && onFragment(block.block);
  else child2 = findTransitionBlock(block.block.nodes, onFragment);
  else {
    if (getComponentName(block.type) === displayName) return void 0;
    child2 = findTransitionBlock(block.block, onFragment);
    if (child2 && child2.$key === void 0) child2.$key = block.uid;
  }
  else if (isArray(block)) {
    let hasFound = false;
    for (const c of block) {
      if (c instanceof Comment) continue;
      const item = findTransitionBlock(c, onFragment);
      if (hasFound) {
        warn2("<transition> can only be used on a single element or component. Use <transition-group> for lists.");
        break;
      }
      child2 = item;
      hasFound = true;
      if (false) break;
    }
  } else if (isFragment(block)) if (block.insert) child2 = block;
  else {
    if (onFragment) onFragment(block);
    child2 = findTransitionBlock(block.nodes, onFragment);
  }
  return child2;
}
function setTransitionHooksOnFragment(block, hooks) {
  if (isFragment(block)) {
    block.$transition = hooks;
    if (block.nodes && isFragment(block.nodes)) setTransitionHooksOnFragment(block.nodes, hooks);
  } else if (isArray(block)) for (let i = 0; i < block.length; i++) setTransitionHooksOnFragment(block[i], hooks);
}
function setTransitionHooks$1(block, hooks) {
  if (isVaporComponent2(block)) {
    block = findTransitionBlock(block.block);
    if (!block) return;
  }
  block.$transition = hooks;
}
var isInteropEnabled = false;
function setInteropEnabled() {
  isInteropEnabled = true;
}
function defineVaporComponent(comp, extraOptions) {
  if (isFunction(comp)) return extend({ name: comp.name }, extraOptions, {
    setup: comp,
    __vapor: true
  });
  comp.__vapor = true;
  return comp;
}
var currentKeepAliveCtx = null;
function setCurrentKeepAliveCtx(ctx) {
  try {
    return currentKeepAliveCtx;
  } finally {
    currentKeepAliveCtx = ctx;
  }
}
var compositeKeyCache = /* @__PURE__ */ new WeakMap();
var compositeKeyCachePrimitive = /* @__PURE__ */ new Map();
function getCompositeKey(type, branchKey) {
  const isObjectType = isObject(type) || isFunction(type);
  const perType = isObjectType ? compositeKeyCache.get(type) || /* @__PURE__ */ new Map() : compositeKeyCachePrimitive.get(type) || /* @__PURE__ */ new Map();
  if (isObjectType) {
    if (!compositeKeyCache.has(type)) compositeKeyCache.set(type, perType);
  } else if (!compositeKeyCachePrimitive.has(type)) compositeKeyCachePrimitive.set(type, perType);
  let composite = perType.get(branchKey);
  if (!composite) {
    composite = {
      type,
      branchKey
    };
    perType.set(branchKey, composite);
  }
  return composite;
}
var VaporKeepAliveImpl = defineVaporComponent({
  name: "VaporKeepAlive",
  __isKeepAlive: true,
  props: {
    include: [
      String,
      RegExp,
      Array
    ],
    exclude: [
      String,
      RegExp,
      Array
    ],
    max: [String, Number]
  },
  setup(props, { slots, expose: expose2 }) {
    let exposed;
    expose2(exposed);
    if (!slots.default) return;
    const keepAliveInstance = currentInstance;
    const cache = /* @__PURE__ */ new Map();
    const keys = /* @__PURE__ */ new Set();
    const storageContainer = createElement("div");
    const keptAliveScopes = /* @__PURE__ */ new Map();
    let currentBranchKey;
    let current;
    if (true) keepAliveInstance.__v_cache = cache;
    if (true) {
      const rerender2 = keepAliveInstance.hmrRerender;
      keepAliveInstance.hmrRerender = () => {
        keepAliveInstance.exposed = null;
        cache.forEach((cached) => resetCachedShapeFlag(cached));
        cache.clear();
        keys.clear();
        keptAliveScopes.forEach((scope) => scope.stop());
        keptAliveScopes.clear();
        storageContainer.innerHTML = "";
        current = void 0;
        rerender2();
      };
    }
    keepAliveInstance.ctx = {
      getStorageContainer: () => storageContainer,
      getCachedComponent: (comp, key) => {
        if (isInteropEnabled && isVNode(comp)) return cache.get(resolveKey(comp.type, comp.key, currentBranchKey));
        return cache.get(resolveKey(comp, key, currentBranchKey));
      },
      activate: (instance, parentNode2, anchor) => {
        current = instance;
        activate$1(instance, parentNode2, anchor);
      },
      deactivate: (instance) => {
        current = void 0;
        deactivate$1(instance, storageContainer);
      }
    };
    const innerCacheBlock = (key, block) => {
      const { max } = props;
      if (cache.has(key)) {
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) pruneCacheEntry(keys.values().next().value);
      }
      cache.set(key, block);
      current = block;
    };
    const cacheBlock = () => {
      const block = keepAliveInstance.block;
      if (isDynamicFragment(block)) {
        const transition = block.$transition;
        if (transition && transition.mode === "out-in" && transition.state.isLeaving) return;
      }
      const [innerBlock, interop] = getInnerBlock(block);
      if (!innerBlock || !shouldCache(innerBlock, props, interop)) return;
      innerCacheBlock(getCacheKey(innerBlock, interop, currentBranchKey), innerBlock);
    };
    const processShapeFlag = (block) => {
      const [innerBlock, interop] = getInnerBlock(block);
      if (!innerBlock || !shouldCache(innerBlock, props, interop)) return false;
      if (interop && isInteropEnabled) {
        const cacheKey = getCacheKey(innerBlock, true, currentBranchKey);
        if (cache.has(cacheKey)) innerBlock.vnode.shapeFlag |= 512;
        innerBlock.vnode.shapeFlag |= 256;
      } else {
        const cacheKey = getCacheKey(innerBlock, false, currentBranchKey);
        if (cache.has(cacheKey)) innerBlock.shapeFlag |= 512;
        innerBlock.shapeFlag |= 256;
      }
      return true;
    };
    const pruneCache = (filter) => {
      cache.forEach((cached, key) => {
        const instance = getInstanceFromCache(cached);
        if (!instance) return;
        const name = getComponentName(instance.type);
        if (name && !filter(name)) pruneCacheEntry(key);
      });
    };
    const pruneCacheEntry = (key) => {
      const cached = cache.get(key);
      if (cached && (!current || cached !== current)) {
        resetCachedShapeFlag(cached);
        remove2(cached);
      } else if (current) resetCachedShapeFlag(current);
      cache.delete(key);
      keys.delete(key);
    };
    watch2(() => [props.include, props.exclude], ([include, exclude]) => {
      include && pruneCache((name) => matches(include, name));
      exclude && pruneCache((name) => !matches(exclude, name));
    }, {
      flush: "post",
      deep: true
    });
    onMounted(cacheBlock);
    onUpdated(cacheBlock);
    onBeforeUnmount(() => {
      cache.forEach((cached, key) => {
        const instance = getInstanceFromCache(cached);
        if (!instance) return;
        resetCachedShapeFlag(cached);
        cache.delete(key);
        if (current) {
          if (getCacheKey(current, !isVaporComponent2(current), currentBranchKey) === key) {
            const da = instance.da;
            da && queuePostFlushCb(da);
            return;
          }
        }
        remove2(cached, storageContainer);
      });
      keptAliveScopes.forEach((scope) => scope.stop());
      keptAliveScopes.clear();
    });
    const prevCtx = setCurrentKeepAliveCtx({
      processShapeFlag,
      cacheBlock,
      cacheScope(key, scope) {
        keptAliveScopes.set(key, scope);
      },
      getScope(key) {
        const scope = keptAliveScopes.get(key);
        if (scope) {
          keptAliveScopes.delete(key);
          return scope;
        }
      },
      setCurrentBranchKey(key) {
        try {
          return currentBranchKey;
        } finally {
          currentBranchKey = key;
        }
      }
    });
    let children = slots.default();
    setCurrentKeepAliveCtx(prevCtx);
    if (isArray(children)) {
      children = children.filter((child2) => !(child2 instanceof Comment));
      if (children.length > 1) {
        if (true) warn2(`KeepAlive should contain exactly one component child.`);
        return children;
      }
    }
    return children;
  }
});
var VaporKeepAlive = VaporKeepAliveImpl;
var shouldCache = (block, props, interop = false) => {
  const isAsync = !interop && isAsyncWrapper(block);
  const type = interop && isInteropEnabled ? block.vnode.type : block.type;
  if (isAsync && !type.__asyncResolved) return false;
  const { include, exclude } = props;
  const name = getComponentName(isAsync ? type.__asyncResolved : type);
  return !(include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name));
};
var resetCachedShapeFlag = (cached) => {
  if (isVaporComponent2(cached)) resetShapeFlag(cached);
  else if (isInteropEnabled) resetShapeFlag(cached.vnode);
};
function resolveKey(type, key, branchKey) {
  if (key != null) return getCompositeKey(type, key);
  if (branchKey !== void 0) return getCompositeKey(type, branchKey);
  return type;
}
function getCacheKey(block, interop, branchKey) {
  if (interop && isInteropEnabled) {
    const frag = block;
    return resolveKey(frag.vnode.type, frag.$key !== void 0 ? frag.$key : frag.vnode.key, branchKey);
  }
  const instance = block;
  return resolveKey(instance.type, instance.key, branchKey);
}
function getInnerBlock(block) {
  if (isVaporComponent2(block)) return [block, false];
  else if (isInteropEnabled && isInteropFragment(block)) return [block, true];
  else if (isFragment(block)) return getInnerBlock(block.nodes);
  return [void 0, false];
}
function isInteropFragment(block) {
  return !!(isFragment(block) && block.vnode);
}
function getInstanceFromCache(cached) {
  if (isVaporComponent2(cached)) return cached;
  if (isInteropEnabled) return cached.vnode.component;
}
function activate$1(instance, parentNode2, anchor) {
  move(instance.block, parentNode2, anchor, 0, instance);
  queuePostFlushCb(() => {
    instance.isDeactivated = false;
    if (instance.a) invokeArrayFns(instance.a);
  });
  if (true) devtoolsComponentAdded(instance);
}
function deactivate$1(instance, container) {
  move(instance.block, container, null, 1, instance);
  queuePostFlushCb(() => {
    if (instance.da) invokeArrayFns(instance.da);
    instance.isDeactivated = true;
  });
  if (true) devtoolsComponentAdded(instance);
}
var parentSuspense = null;
function setParentSuspense(suspense) {
  try {
    return parentSuspense;
  } finally {
    parentSuspense = suspense;
  }
}
var interopKey = /* @__PURE__ */ Symbol(`interop`);
var vaporInteropImpl = {
  mount(vnode, container, anchor, parentComponent, parentSuspense2, onBeforeMount2) {
    let selfAnchor = vnode.anchor = createTextNode();
    if (isHydrating$1) queuePostFlushCb(() => container.insertBefore(selfAnchor, anchor));
    else {
      vnode.el = selfAnchor;
      container.insertBefore(selfAnchor, anchor);
    }
    const prev = currentInstance;
    simpleSetCurrentInstance(parentComponent);
    const props = {};
    for (const key in vnode.props) if (!isReservedProp(key)) props[key] = vnode.props[key];
    const propsRef = shallowRef(props);
    const slotsRef = shallowRef(vnode.children);
    let prevSuspense = null;
    if (parentSuspense2) prevSuspense = setParentSuspense(parentSuspense2);
    const dynamicPropSource = [() => propsRef.value];
    dynamicPropSource[interopKey] = true;
    const instance = vnode.component = createComponent(vnode.type, { $: dynamicPropSource }, { _: slotsRef }, void 0, void 0, parentComponent ? parentComponent.appContext : vnode.appContext);
    instance.rawPropsRef = propsRef;
    instance.rawSlotsRef = slotsRef;
    if (isKeepAlive(parentComponent)) instance.shapeFlag = vnode.shapeFlag;
    if (vnode.transition) setTransitionHooks$1(instance, vnode.transition);
    if (parentSuspense2) setParentSuspense(prevSuspense);
    const rootEl = getRootElement(instance);
    if (rootEl) vnode.el = rootEl;
    if (vnode.dirs) if (rootEl) onBeforeMount2 && onBeforeMount2();
    else {
      if (true) warn2("Runtime directive used on component with non-element root node. The directives will not function as intended.");
      vnode.dirs = null;
    }
    mountComponent(instance, container, selfAnchor);
    simpleSetCurrentInstance(prev);
    return instance;
  },
  update(n1, n2, shouldUpdate, onBeforeUpdate2) {
    n2.component = n1.component;
    n2.el = n2.anchor = n1.anchor;
    const instance = n2.component;
    const rootEl = getRootElement(instance);
    if (rootEl) n2.el = rootEl;
    if (n2.dirs) if (rootEl) onBeforeUpdate2 && onBeforeUpdate2();
    else n2.dirs = null;
    if (shouldUpdate) {
      instance.rawPropsRef.value = n2.props;
      instance.rawSlotsRef.value = n2.children;
    }
  },
  unmount(vnode, doRemove) {
    const container = doRemove ? vnode.anchor.parentNode : void 0;
    const instance = vnode.component;
    if (instance) {
      if (instance.block) unmountComponent(instance, container);
    } else if (vnode.vb) remove2(vnode.vb, container);
    remove2(vnode.anchor, container);
  },
  slot(n1, n2, container, anchor, parentComponent, parentSuspense2) {
    if (!n1) {
      const prev = currentInstance;
      let prevSuspense = null;
      simpleSetCurrentInstance(parentComponent);
      if (parentSuspense2) prevSuspense = setParentSuspense(parentSuspense2);
      let selfAnchor;
      const { slot, fallback } = n2.vs;
      const propsRef = n2.vs.ref = shallowRef(n2.props);
      let slotBlock = slot(new Proxy(propsRef, vaporSlotPropsProxyHandler));
      if (fallback) {
        const vaporFallback = createVaporFallback(fallback, parentComponent);
        const emptyFrag = attachSlotFallback(slotBlock, vaporFallback);
        if (!isValidBlock(slotBlock)) slotBlock = renderSlotFallback(slotBlock, vaporFallback, emptyFrag);
      }
      if (isFragment(slotBlock)) selfAnchor = slotBlock.anchor;
      if (parentSuspense2) setParentSuspense(prevSuspense);
      simpleSetCurrentInstance(prev);
      if (!selfAnchor) selfAnchor = createTextNode();
      insert(n2.el = n2.anchor = selfAnchor, container, anchor);
      insert(n2.vb = slotBlock, container, selfAnchor);
    } else {
      n2.el = n2.anchor = n1.anchor;
      n2.vb = n1.vb;
      (n2.vs.ref = n1.vs.ref).value = n2.props;
    }
  },
  move(vnode, container, anchor, moveType) {
    move(vnode.vb || vnode.component, container, anchor, moveType);
    move(vnode.anchor, container, anchor, moveType);
  },
  hydrate(vnode, node, container, anchor, parentComponent, parentSuspense2) {
    if (!isHydrating$1 && !isHydrating) return node;
    hydrateNode(node, () => this.mount(vnode, container, anchor, parentComponent, parentSuspense2));
    return _next(node);
  },
  hydrateSlot(vnode, node) {
    if (!isHydrating$1 && !isHydrating) return node;
    const { slot } = vnode.vs;
    const propsRef = vnode.vs.ref = shallowRef(vnode.props);
    hydrateNode(node, () => {
      vnode.vb = slot(new Proxy(propsRef, vaporSlotPropsProxyHandler));
      vnode.anchor = vnode.el = currentHydrationNode;
      if (!vnode.anchor) throw new Error(`Failed to locate slot anchor. this is likely a Vue internal bug.`);
    });
    return vnode.anchor;
  },
  setTransitionHooks(component, hooks) {
    setTransitionHooks$1(component, hooks);
  },
  activate(vnode, container, anchor, parentComponent) {
    const cached = parentComponent.ctx.getCachedComponent(vnode);
    vnode.el = cached.el;
    vnode.component = cached.component;
    vnode.anchor = cached.anchor;
    activate$1(vnode.component, container, anchor);
    insert(vnode.anchor, container, anchor);
  },
  deactivate(vnode, container) {
    deactivate$1(vnode.component, container);
    insert(vnode.anchor, container);
  }
};
var vaporSlotPropsProxyHandler = {
  get(target, key) {
    return target.value[key];
  },
  has(target, key) {
    return target.value[key];
  },
  ownKeys(target) {
    return Object.keys(target.value);
  }
};
var vaporSlotsProxyHandler = { get(target, key) {
  const slot = target[key];
  if (isFunction(slot)) {
    slot.__vapor = true;
    const wrapped = (props) => [renderSlot({ [key]: slot }, key, props)];
    wrapped.__vs = slot;
    return wrapped;
  }
  return slot;
} };
var vdomHydrateNode;
function mountVNode(internals, vnode, parentComponent) {
  const suspense = parentSuspense || parentComponent && parentComponent.suspense;
  const frag = new VaporFragment([]);
  frag.vnode = vnode;
  let isMounted = false;
  const unmount = (parentNode2, transition) => {
    if (transition) setTransitionHooks(vnode, transition);
    if (vnode.shapeFlag & 256) if (vnode.type.__vapor) deactivate$1(vnode.component, parentComponent.ctx.getStorageContainer());
    else deactivate(vnode, parentComponent.ctx.getStorageContainer(), internals, parentComponent, null);
    else internals.um(vnode, parentComponent, null, !!parentNode2);
  };
  frag.hydrate = () => {
    if (!isHydrating$1) return;
    hydrateVNode(vnode, parentComponent);
    onScopeDispose(unmount, true);
    isMounted = true;
    frag.nodes = vnode.el;
  };
  frag.insert = (parentNode2, anchor, transition) => {
    if (isHydrating$1) return;
    if (vnode.shapeFlag & 512) {
      if (vnode.type.__vapor) activate$1(vnode.component, parentNode2, anchor);
      else activate(vnode, parentNode2, anchor, internals, parentComponent, null, void 0, false);
      return;
    } else {
      const prev = currentInstance;
      simpleSetCurrentInstance(parentComponent);
      if (!isMounted) {
        if (transition) setTransitionHooks(vnode, transition);
        internals.p(null, vnode, parentNode2, anchor, parentComponent, suspense, void 0, vnode.slotScopeIds);
        onScopeDispose(unmount, true);
        isMounted = true;
      } else internals.m(vnode, parentNode2, anchor, 2, parentComponent);
      simpleSetCurrentInstance(prev);
    }
    frag.nodes = vnode.el;
    if (isMounted && frag.onUpdated) frag.onUpdated.forEach((m) => m());
  };
  frag.remove = unmount;
  return frag;
}
function createVDOMComponent(internals, component, parentComponent, rawProps, rawSlots, isSingleRoot) {
  const suspense = parentSuspense || parentComponent && parentComponent.suspense;
  const useBridge = shouldUseRendererBridge(component);
  const comp = useBridge ? ensureRendererBridge(component) : component;
  const frag = new VaporFragment([]);
  const vnode = frag.vnode = createVNode(comp, rawProps && extend({}, new Proxy(rawProps, rawPropsProxyHandlers)));
  if (currentKeepAliveCtx) {
    currentKeepAliveCtx.processShapeFlag(frag);
    setCurrentKeepAliveCtx(null);
  }
  const wrapper = new VaporComponentInstance(useBridge ? comp : { props: component.props }, rawProps, rawSlots, parentComponent ? parentComponent.appContext : void 0, void 0);
  vnode.vi = (instance) => {
    instance.props = shallowReactive(wrapper.props);
    const attrs = instance.attrs = createInternalObject();
    for (const key in wrapper.attrs) if (!isEmitListener(instance.emitsOptions, key)) attrs[key] = wrapper.attrs[key];
    instance.slots = wrapper.slots === EMPTY_OBJ ? EMPTY_OBJ : new Proxy(wrapper.slots, vaporSlotsProxyHandler);
  };
  let rawRef = null;
  let isMounted = false;
  const unmount = (parentNode2, transition) => {
    if (rawRef) setRef(rawRef, null, null, vnode, true);
    if (transition) setTransitionHooks(vnode, transition);
    if (vnode.shapeFlag & 256) {
      deactivate(vnode, parentComponent.ctx.getStorageContainer(), internals, parentComponent, null);
      return;
    }
    internals.umt(vnode.component, null, !!parentNode2);
  };
  frag.hydrate = () => {
    if (!isHydrating$1) return;
    hydrateVNode(vnode, parentComponent, !isSingleRoot);
    onScopeDispose(unmount, true);
    isMounted = true;
    frag.nodes = vnode.el;
  };
  vnode.scopeId = getCurrentScopeId() || null;
  vnode.slotScopeIds = currentSlotScopeIds;
  frag.insert = (parentNode2, anchor, transition) => {
    if (isHydrating$1) return;
    if (vnode.shapeFlag & 512) activate(vnode, parentNode2, anchor, internals, parentComponent, null, void 0, false);
    else {
      const prev = currentInstance;
      simpleSetCurrentInstance(parentComponent);
      if (!isMounted) {
        if (transition) setTransitionHooks(vnode, transition);
        internals.mt(vnode, parentNode2, anchor, parentComponent, suspense, void 0, false);
        if (rawRef) setRef(rawRef, null, null, vnode);
        onScopeDispose(unmount, true);
        isMounted = true;
      } else internals.m(vnode, parentNode2, anchor, 2, parentComponent);
      simpleSetCurrentInstance(prev);
    }
    frag.nodes = vnode.el;
    if (isMounted && frag.onUpdated) frag.onUpdated.forEach((m) => m());
  };
  frag.remove = unmount;
  frag.setRef = (instance, ref2, refFor, refKey) => {
    rawRef = normalizeRef({
      ref: ref2,
      ref_for: refFor,
      ref_key: refKey
    }, instance);
    if (isMounted && rawRef) setRef(rawRef, null, null, vnode);
  };
  return frag;
}
var rendererBridgeCache = /* @__PURE__ */ new WeakMap();
function shouldUseRendererBridge(component) {
  return !!(component.__isTeleport || component.__isSuspense);
}
function ensureRendererBridge(component) {
  let bridge = rendererBridgeCache.get(component);
  if (!bridge) rendererBridgeCache.set(component, bridge = (props, { slots }) => createVNode(component, props, slots));
  return bridge;
}
function renderVDOMSlot(internals, slotsRef, name, props, parentComponent, fallback) {
  const suspense = parentSuspense || parentComponent.suspense;
  const frag = new VaporFragment([]);
  if (fallback && !frag.fallback) frag.fallback = fallback;
  let isMounted = false;
  let currentBlock2 = null;
  let currentVNode = null;
  frag.insert = (parentNode2, anchor) => {
    if (isHydrating$1) return;
    if (!isMounted) {
      render2(parentNode2, anchor);
      isMounted = true;
    } else if (currentVNode) internals.m(currentVNode, parentNode2, anchor, 2, parentComponent);
    else if (currentBlock2) insert(currentBlock2, parentNode2, anchor);
    frag.remove = (parentNode3) => {
      if (currentBlock2) remove2(currentBlock2, parentNode3);
      else if (currentVNode) internals.um(currentVNode, parentComponent, null);
    };
    if (isMounted && frag.onUpdated) frag.onUpdated.forEach((m) => m());
  };
  const render2 = (parentNode2, anchor) => {
    renderEffect(() => {
      const effectiveFallback = frag.fallback || fallback;
      let slotContent;
      let isEmpty = true;
      let emptyFrag = null;
      if (slotsRef.value) {
        slotContent = renderSlot(slotsRef.value, isFunction(name) ? name() : name, props);
        if (isVNode(slotContent)) {
          const children = slotContent.children;
          ensureVaporSlotFallback(children, effectiveFallback);
          isEmpty = children.length === 0;
        } else {
          if (effectiveFallback && slotContent) emptyFrag = attachSlotFallback(slotContent, () => effectiveFallback(internals, parentComponent));
          isEmpty = !isValidBlock(slotContent);
        }
      }
      let resolved = slotContent;
      if (isEmpty && effectiveFallback) if (isVNode(slotContent)) resolved = effectiveFallback(internals, parentComponent);
      else if (slotContent) resolved = renderSlotFallback(slotContent, () => effectiveFallback(internals, parentComponent), emptyFrag);
      else resolved = effectiveFallback(internals, parentComponent);
      if (isHydrating$1) {
        if (isVNode(resolved)) {
          hydrateVNode(resolved, parentComponent);
          currentVNode = resolved;
          currentBlock2 = null;
          frag.nodes = resolved.el;
        } else if (resolved) {
          currentBlock2 = resolved;
          currentVNode = null;
          frag.nodes = resolved;
        } else {
          currentBlock2 = null;
          currentVNode = null;
          frag.nodes = [];
        }
        return;
      }
      if (isVNode(resolved)) {
        if (currentBlock2) {
          remove2(currentBlock2, parentNode2);
          currentBlock2 = null;
        }
        internals.p(currentVNode, resolved, parentNode2, anchor, parentComponent, suspense, void 0, resolved.slotScopeIds);
        currentVNode = resolved;
        frag.nodes = resolved.el;
        return;
      }
      if (resolved) {
        if (currentVNode) {
          internals.um(currentVNode, parentComponent, null, true);
          currentVNode = null;
        }
        if (currentBlock2) remove2(currentBlock2, parentNode2);
        insert(resolved, parentNode2, anchor);
        currentBlock2 = resolved;
        frag.nodes = resolved;
        return;
      }
      if (currentBlock2) {
        remove2(currentBlock2, parentNode2);
        currentBlock2 = null;
      }
      if (currentVNode) {
        internals.um(currentVNode, parentComponent, null, true);
        currentVNode = null;
      }
      frag.nodes = [];
    });
  };
  frag.hydrate = () => {
    if (!isHydrating$1) return;
    render2();
    isMounted = true;
  };
  return frag;
}
var vaporInteropPlugin = (app) => {
  setInteropEnabled();
  const internals = ensureRenderer().internals;
  app._context.vapor = extend(vaporInteropImpl, {
    vdomMount: createVDOMComponent.bind(null, internals),
    vdomUnmount: internals.umt,
    vdomSlot: renderVDOMSlot.bind(null, internals),
    vdomMountVNode: mountVNode.bind(null, internals)
  });
  const mount = app.mount;
  app.mount = ((...args) => {
    optimizePropertyLookup();
    return mount(...args);
  });
};
function hydrateVNode(vnode, parentComponent, skipFragmentAnchor = false) {
  locateHydrationNode();
  let node = currentHydrationNode;
  if (skipFragmentAnchor && isComment2(node, "[")) setCurrentHydrationNode(node = node.nextSibling);
  if (!vdomHydrateNode) vdomHydrateNode = ensureHydrationRenderer().hydrateNode;
  const nextNode = vdomHydrateNode(node, vnode, parentComponent, null, null, false);
  if (nextNode) setCurrentHydrationNode(nextNode);
  else advanceHydrationNode(node);
}
function createVaporFallback(fallback, parentComponent) {
  const internals = ensureRenderer().internals;
  return () => createFallback(fallback)(internals, parentComponent);
}
var createFallback = (fallback) => (internals, parentComponent) => {
  const fallbackNodes = fallback();
  if (isArray(fallbackNodes) && fallbackNodes.every(isVNode)) {
    const frag = new VaporFragment([]);
    frag.insert = (parentNode2, anchor) => {
      fallbackNodes.forEach((vnode) => {
        internals.p(null, vnode, parentNode2, anchor, parentComponent);
      });
    };
    frag.remove = (parentNode2) => {
      fallbackNodes.forEach((vnode) => {
        internals.um(vnode, parentComponent, null, true);
      });
    };
    return frag;
  }
  return fallbackNodes;
};
function normalizeEmitsOptions2(comp) {
  const cached = comp.__emitsOptions;
  if (cached) return cached;
  const raw = comp.emits;
  if (!raw) return null;
  let normalized;
  if (isArray(raw)) {
    normalized = {};
    for (const key of raw) normalized[key] = null;
  } else normalized = raw;
  return comp.__emitsOptions = normalized;
}
function emit2(instance, event, ...rawArgs) {
  baseEmit(instance, instance.rawProps || EMPTY_OBJ, propGetter, event, ...rawArgs);
}
function propGetter(rawProps, key) {
  const dynamicSources = rawProps.$;
  if (dynamicSources) {
    let i = dynamicSources.length;
    while (i--) {
      const source = resolveSource(dynamicSources[i]);
      if (hasOwn(source, key)) return dynamicSources[interopKey] || isOn(key) ? source[key] : resolveSource(source[key]);
    }
  }
  return rawProps[key] && resolveSource(rawProps[key]);
}
function resolveSource(source) {
  return isFunction(source) ? resolveFunctionSource(source) : source;
}
function resolveFunctionSource(source) {
  if (source._cache) return source._cache.value;
  const parent = currentInstance && currentInstance.parent;
  if (parent) {
    source._cache = computed(() => {
      const prev = setCurrentInstance(parent);
      try {
        return source();
      } finally {
        setCurrentInstance(...prev);
      }
    });
    onScopeDispose(() => source._cache = void 0);
    return source._cache.value;
  }
  return source();
}
function getPropsProxyHandlers(comp, once) {
  if (comp.__propsHandlers) return comp.__propsHandlers;
  const propsOptions = normalizePropsOptions2(comp)[0];
  const emitsOptions = normalizeEmitsOptions2(comp);
  const isProp = propsOptions ? (key) => isString(key) && hasOwn(propsOptions, camelize(key)) : NO;
  const isAttr = propsOptions ? (key) => isString(key) && key !== "$" && !isProp(key) && !isEmitListener(emitsOptions, key) : (key) => isString(key);
  const getProp = (instance, key) => {
    if (key === "__v_isReactive") return true;
    if (!isProp(key)) return;
    const rawProps = instance.rawProps;
    const dynamicSources = rawProps.$;
    if (dynamicSources) {
      let i = dynamicSources.length;
      let source, isDynamic, rawKey;
      while (i--) {
        source = dynamicSources[i];
        isDynamic = isFunction(source);
        source = isDynamic ? resolveFunctionSource(source) : source;
        for (rawKey in source) if (camelize(rawKey) === key) return resolvePropValue(propsOptions, key, isDynamic ? source[rawKey] : resolveFunctionSource(source[rawKey]), instance, resolveDefault);
      }
    }
    for (const rawKey in rawProps) if (camelize(rawKey) === key) return resolvePropValue(propsOptions, key, resolveSource(rawProps[rawKey]), instance, resolveDefault);
    return resolvePropValue(propsOptions, key, void 0, instance, resolveDefault, true);
  };
  const withOnceCache = (getter) => {
    return ((instance, key) => {
      const cache = instance.oncePropsCache || (instance.oncePropsCache = {});
      if (!(key in cache)) {
        pauseTracking();
        try {
          cache[key] = getter(instance, key);
        } finally {
          resetTracking();
        }
      }
      return cache[key];
    });
  };
  const getOnceProp = withOnceCache(getProp);
  const propsHandlers = propsOptions ? {
    get: (target, key) => (once ? getOnceProp : getProp)(target, key),
    has: (_, key) => isProp(key),
    ownKeys: () => Object.keys(propsOptions),
    getOwnPropertyDescriptor(target, key) {
      if (isProp(key)) return {
        configurable: true,
        enumerable: true,
        get: () => (once ? getOnceProp : getProp)(target, key)
      };
    }
  } : null;
  if (propsOptions) Object.assign(propsHandlers, {
    set: propsSetDevTrap,
    deleteProperty: propsDeleteDevTrap
  });
  const getAttr = (target, key) => {
    if (isString(key) && !isProp(key) && !isEmitListener(emitsOptions, key)) return getAttrFromRawProps(target, key);
  };
  const hasAttr = (target, key) => {
    if (isAttr(key)) return hasAttrFromRawProps(target, key);
    else return false;
  };
  const getOnceAttr = withOnceCache((instance, key) => getAttr(instance.rawProps, key));
  const attrsHandlers = {
    get: (target, key) => once ? getOnceAttr(target, key) : getAttr(target.rawProps, key),
    has: (target, key) => hasAttr(target.rawProps, key),
    ownKeys: (target) => getKeysFromRawProps(target.rawProps).filter(isAttr),
    getOwnPropertyDescriptor(target, key) {
      if (isString(key) && hasAttr(target.rawProps, key)) return {
        configurable: true,
        enumerable: true,
        get: () => once ? getOnceAttr(target, key) : getAttr(target.rawProps, key)
      };
    }
  };
  if (true) Object.assign(attrsHandlers, {
    set: propsSetDevTrap,
    deleteProperty: propsDeleteDevTrap
  });
  return comp.__propsHandlers = [propsHandlers, attrsHandlers];
}
function getAttrFromRawProps(rawProps, key) {
  if (key === "$") return;
  const merged = key === "class" || key === "style" ? [] : void 0;
  const dynamicSources = rawProps.$;
  if (dynamicSources) {
    let i = dynamicSources.length;
    let source, isDynamic;
    while (i--) {
      source = dynamicSources[i];
      isDynamic = isFunction(source);
      source = isDynamic ? resolveFunctionSource(source) : source;
      if (source && hasOwn(source, key)) {
        const value = isDynamic ? source[key] : resolveFunctionSource(source[key]);
        if (merged) merged.push(value);
        else return value;
      }
    }
  }
  if (hasOwn(rawProps, key)) {
    const value = resolveSource(rawProps[key]);
    if (merged) merged.push(value);
    else return value;
  }
  if (merged && merged.length) return merged;
}
function hasAttrFromRawProps(rawProps, key) {
  if (key === "$") return false;
  const dynamicSources = rawProps.$;
  if (dynamicSources) {
    let i = dynamicSources.length;
    while (i--) {
      const source = resolveSource(dynamicSources[i]);
      if (source && hasOwn(source, key)) return true;
    }
  }
  return hasOwn(rawProps, key);
}
function getKeysFromRawProps(rawProps) {
  const keys = [];
  for (const key in rawProps) if (key !== "$") keys.push(key);
  const dynamicSources = rawProps.$;
  if (dynamicSources) {
    let i = dynamicSources.length;
    let source;
    while (i--) {
      source = isFunction(dynamicSources[i]) ? resolveFunctionSource(dynamicSources[i]) : dynamicSources[i];
      for (const key in source) keys.push(key);
    }
  }
  return Array.from(new Set(keys));
}
function normalizePropsOptions2(comp) {
  const cached = comp.__propsOptions;
  if (cached) return cached;
  const raw = comp.props;
  if (!raw) return EMPTY_ARR;
  const normalized = {};
  const needCastKeys = [];
  baseNormalizePropsOptions(raw, normalized, needCastKeys);
  return comp.__propsOptions = [normalized, needCastKeys];
}
function resolveDefault(factory, instance) {
  const prev = setCurrentInstance(instance);
  const res = factory.call(null, instance.props);
  setCurrentInstance(...prev);
  return res;
}
function hasFallthroughAttrs(comp, rawProps) {
  if (rawProps) if (rawProps.$ || !comp.props) return true;
  else {
    const propsOptions = normalizePropsOptions2(comp)[0];
    for (const key in rawProps) if (!hasOwn(propsOptions, camelize(key))) return true;
  }
  return false;
}
function setupPropsValidation(instance) {
  const rawProps = instance.rawProps;
  if (!rawProps) return;
  renderEffect(() => {
    pushWarningContext(instance);
    validateProps(resolveDynamicProps(rawProps), instance.props, normalizePropsOptions2(instance.type)[0]);
    popWarningContext();
  }, true);
}
function resolveDynamicProps(props) {
  const mergedRawProps = {};
  for (const key in props) if (key !== "$") mergedRawProps[key] = resolveSource(props[key]);
  if (props.$) for (const source of props.$) {
    const isDynamic = isFunction(source);
    const resolved = isDynamic ? resolveFunctionSource(source) : source;
    for (const key in resolved) {
      const value = isDynamic ? resolved[key] : resolveFunctionSource(source[key]);
      if (key === "class" || key === "style") {
        const existing = mergedRawProps[key];
        if (isArray(existing)) existing.push(value);
        else mergedRawProps[key] = [existing, value];
      } else mergedRawProps[key] = value;
    }
  }
  return mergedRawProps;
}
function propsSetDevTrap(_, key) {
  warn2(`Attempt to mutate prop ${JSON.stringify(key)} failed. Props are readonly.`);
  return true;
}
function propsDeleteDevTrap(_, key) {
  warn2(`Attempt to delete prop ${JSON.stringify(key)} failed. Props are readonly.`);
  return true;
}
var rawPropsProxyHandlers = {
  get: getAttrFromRawProps,
  has: hasAttrFromRawProps,
  ownKeys: getKeysFromRawProps,
  getOwnPropertyDescriptor(target, key) {
    if (hasAttrFromRawProps(target, key)) return {
      configurable: true,
      enumerable: true,
      get: () => getAttrFromRawProps(target, key)
    };
  }
};
var inOnceSlot = false;
var currentSlotScopeIds = null;
function setCurrentSlotScopeIds(scopeIds) {
  try {
    return currentSlotScopeIds;
  } finally {
    currentSlotScopeIds = scopeIds;
  }
}
var dynamicSlotsProxyHandlers = {
  get: getSlot,
  has: (target, key) => !!getSlot(target, key),
  getOwnPropertyDescriptor(target, key) {
    const slot = getSlot(target, key);
    if (slot) return {
      configurable: true,
      enumerable: true,
      value: slot
    };
  },
  ownKeys(target) {
    let keys = Object.keys(target);
    const dynamicSources = target.$;
    if (dynamicSources) {
      keys = keys.filter((k) => k !== "$");
      for (const source of dynamicSources) if (isFunction(source)) {
        const slot = resolveFunctionSource(source);
        if (slot) if (isArray(slot)) for (const s of slot) keys.push(String(s.name));
        else keys.push(String(slot.name));
      } else keys.push(...Object.keys(source));
    }
    return keys;
  },
  set: NO,
  deleteProperty: NO
};
function getSlot(target, key) {
  if (key === "$") return;
  const dynamicSources = target.$;
  if (dynamicSources) {
    let i = dynamicSources.length;
    let source;
    while (i--) {
      source = dynamicSources[i];
      if (isFunction(source)) {
        const slot = resolveFunctionSource(source);
        if (slot) {
          if (isArray(slot)) {
            for (const s of slot) if (String(s.name) === key) return s.fn;
          } else if (String(slot.name) === key) return slot.fn;
        }
      } else if (hasOwn(source, key)) return source[key];
    }
  }
  if (hasOwn(target, key)) return target[key];
}
var currentSlotOwner = null;
function setCurrentSlotOwner(owner) {
  try {
    return currentSlotOwner;
  } finally {
    currentSlotOwner = owner;
  }
}
function getScopeOwner() {
  return currentSlotOwner || currentInstance;
}
function withVaporCtx(fn) {
  const owner = getScopeOwner();
  return (...args) => {
    const prevOwner = setCurrentSlotOwner(owner);
    try {
      return fn(...args);
    } finally {
      setCurrentSlotOwner(prevOwner);
    }
  };
}
function createSlot(name, rawProps, fallback, noSlotted, once) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (!isHydrating$1) resetInsertionState();
  const instance = getScopeOwner();
  const rawSlots = instance.rawSlots;
  const slotProps = rawProps ? new Proxy(rawProps, rawPropsProxyHandlers) : EMPTY_OBJ;
  let fragment;
  if (isRef2(rawSlots._) && isInteropEnabled) {
    if (isHydrating$1) locateHydrationNode();
    fragment = instance.appContext.vapor.vdomSlot(rawSlots._, name, slotProps, instance, fallback);
  } else {
    fragment = new SlotFragment();
    const isDynamicName = isFunction(name);
    const slotScopeIds = [];
    if (!noSlotted) {
      const scopeId = instance.type.__scopeId;
      if (scopeId) slotScopeIds.push(`${scopeId}-s`);
    }
    const renderSlot2 = () => {
      const slotName = isFunction(name) ? name() : name;
      if (instance.ce || instance.parent && isAsyncWrapper(instance.parent) && instance.parent.ce) {
        const el = createElement("slot");
        renderEffect(() => {
          setDynamicProps(el, [slotProps, slotName !== "default" ? { name: slotName } : {}]);
        });
        if (fallback) insert(fallback(), el);
        fragment.nodes = el;
        return;
      }
      const slot = getSlot(rawSlots, slotName);
      if (slot) {
        const boundMap = slot._boundMap || (slot._boundMap = /* @__PURE__ */ new WeakMap());
        let bound = boundMap.get(fragment);
        if (!bound) {
          bound = () => {
            const prevSlotScopeIds = setCurrentSlotScopeIds(slotScopeIds.length > 0 ? slotScopeIds : null);
            const prev = inOnceSlot;
            try {
              if (once) inOnceSlot = true;
              return slot(slotProps);
            } finally {
              inOnceSlot = prev;
              setCurrentSlotScopeIds(prevSlotScopeIds);
            }
          };
          boundMap.set(fragment, bound);
        }
        fragment.updateSlot(bound, fallback);
      } else fragment.updateSlot(void 0, fallback);
    };
    if (!once && (isDynamicName || rawSlots.$)) renderEffect(renderSlot2);
    else renderSlot2();
  }
  if (!isHydrating$1) {
    if (!noSlotted) {
      const scopeId = instance.type.__scopeId;
      if (scopeId) setScopeId(fragment, [`${scopeId}-s`]);
    }
    if (_insertionParent) insert(fragment, _insertionParent, _insertionAnchor);
  } else {
    if (fragment.insert) fragment.hydrate();
    if (_isLastInsertion) advanceHydrationNode(_insertionParent);
  }
  return fragment;
}
var RenderEffect = class extends ReactiveEffect {
  constructor(render2) {
    super();
    this.render = render2;
    const instance = currentInstance;
    if (!this.subs && !isVaporComponent2(instance)) warn2("renderEffect called without active EffectScope or Vapor instance.");
    const job = () => {
      if (this.dirty) this.run();
    };
    this.updateJob = () => {
      instance.isUpdating = false;
      instance.u && invokeArrayFns(instance.u);
    };
    if (instance) {
      if (true) {
        this.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
        this.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
      }
      if (instance.type.ce) (instance.renderEffects || (instance.renderEffects = [])).push(this);
      job.i = instance;
    }
    this.job = job;
    this.i = instance;
    this.flags |= 128;
    this.job.flags |= 2;
  }
  fn() {
    const instance = this.i;
    const scope = this.subs ? this.subs.sub : void 0;
    const hasUpdateHooks = instance && (instance.bu || instance.u);
    if (instance) startMeasure(instance, `renderEffect`);
    const prev = setCurrentInstance(instance, scope);
    if (hasUpdateHooks && instance.isMounted && !instance.isUpdating) {
      instance.isUpdating = true;
      instance.bu && invokeArrayFns(instance.bu);
      this.render();
      queuePostFlushCb(this.updateJob);
    } else this.render();
    setCurrentInstance(...prev);
    if (instance) startMeasure(instance, `renderEffect`);
  }
  notify() {
    if (!(this.flags & 256)) queueJob(this.job, this.i ? this.i.uid : void 0);
  }
};
function renderEffect(fn, noLifecycle = false) {
  if (inOnceSlot) return fn();
  const effect2 = new RenderEffect(fn);
  if (noLifecycle) effect2.fn = fn;
  effect2.run();
}
var VaporFragment = class {
  constructor(nodes) {
    this.vnode = null;
    this.nodes = nodes;
  }
};
var ForFragment = class extends VaporFragment {
  constructor(nodes) {
    super(nodes);
  }
};
var DynamicFragment = class extends VaporFragment {
  constructor(anchorLabel, keyed = false) {
    super([]);
    this.hydrate = (isEmpty = false) => {
      if (!isHydrating$1) return;
      if (this.anchor) return;
      if (this.anchorLabel === "if") {
        if (isEmpty) {
          this.anchor = locateFragmentEndAnchor("");
          if (!this.anchor) throw new Error("Failed to locate if anchor. this is likely a Vue internal bug.");
          else {
            if (true) this.anchor.data = this.anchorLabel;
            return;
          }
        }
      } else if (this.anchorLabel === "slot") {
        if (isEmpty && isComment2(currentHydrationNode, "")) {
          this.anchor = currentHydrationNode;
          if (true) this.anchor.data = this.anchorLabel;
          return;
        }
        this.anchor = locateFragmentEndAnchor();
        if (!this.anchor) throw new Error("Failed to locate slot anchor. this is likely a Vue internal bug.");
        else return;
      }
      const { parentNode: pn, nextNode } = findBlockNode(this.nodes);
      queuePostFlushCb(() => {
        pn.insertBefore(this.anchor = true ? createComment(this.anchorLabel) : createTextNode(), nextNode);
      });
    };
    this.keyed = keyed;
    this.slotOwner = currentSlotOwner;
    this.keepAliveCtx = currentKeepAliveCtx;
    if (isHydrating$1) {
      this.anchorLabel = anchorLabel;
      locateHydrationNode();
    } else {
      this.anchor = anchorLabel ? createComment(anchorLabel) : createTextNode();
      if (true) this.anchorLabel = anchorLabel;
    }
  }
  update(render2, key = render2) {
    if (key === this.current) {
      if (isHydrating$1) this.hydrate(true);
      return;
    }
    const transition = this.$transition;
    if (transition && transition.state.isLeaving) {
      this.current = key;
      this.pending = {
        render: render2,
        key
      };
      return;
    }
    const prevKey = this.current;
    this.current = key;
    const instance = currentInstance;
    const prevSub = setActiveSub();
    const parent = isHydrating$1 ? null : this.anchor.parentNode;
    if (this.scope) {
      let retainScope = false;
      const keepAliveCtx = this.keepAliveCtx;
      if (keepAliveCtx && keepAliveCtx.processShapeFlag(this.nodes)) {
        keepAliveCtx.cacheScope(prevKey, this.scope);
        retainScope = true;
      }
      if (!retainScope) this.scope.stop();
      const mode = transition && transition.mode;
      if (mode) {
        applyTransitionLeaveHooks(this.nodes, transition, () => {
          const pending = this.pending;
          if (pending) {
            this.pending = void 0;
            this.current = pending.key;
            this.renderBranch(pending.render, transition, parent, instance);
          } else this.renderBranch(render2, transition, parent, instance);
        });
        parent && remove2(this.nodes, parent);
        if (mode === "out-in") {
          setActiveSub(prevSub);
          return;
        }
      } else parent && remove2(this.nodes, parent);
    }
    this.renderBranch(render2, transition, parent, instance);
    setActiveSub(prevSub);
    if (isHydrating$1) this.hydrate();
  }
  renderBranch(render2, transition, parent, instance) {
    if (render2) {
      const keepAliveCtx = this.keepAliveCtx;
      const scope = keepAliveCtx && keepAliveCtx.getScope(this.current);
      if (scope) this.scope = scope;
      else this.scope = new EffectScope();
      const prevSlotOwner = setCurrentSlotOwner(this.slotOwner);
      const prevKeepAliveCtx = setCurrentKeepAliveCtx(keepAliveCtx);
      const needBranchKey = keepAliveCtx && this.keyed;
      const prevBranchKey = needBranchKey ? keepAliveCtx.setCurrentBranchKey(this.current) : void 0;
      const prevInstance = setCurrentInstance(instance);
      try {
        this.nodes = this.scope.run(render2) || [];
      } finally {
        setCurrentInstance(...prevInstance);
        if (needBranchKey) keepAliveCtx.setCurrentBranchKey(prevBranchKey);
        setCurrentKeepAliveCtx(prevKeepAliveCtx);
        setCurrentSlotOwner(prevSlotOwner);
      }
      if (this.keyed) setKey(this.nodes, this.current);
      if (transition) this.$transition = applyTransitionHooks(this.nodes, transition);
      if (keepAliveCtx) keepAliveCtx.processShapeFlag(this.nodes);
      if (parent) {
        if (this.attrs) {
          if (this.nodes instanceof Element) this.scope.run(() => {
            renderEffect(() => applyFallthroughProps(this.nodes, this.attrs));
          });
          else if (this.anchorLabel === "slot" || isArray(this.nodes) && this.nodes.length) warnExtraneousAttributes(this.attrs);
        }
        insert(this.nodes, parent, this.anchor);
        if (keepAliveCtx && transition && transition.mode === "out-in") keepAliveCtx.cacheBlock();
        if (this.onUpdated) this.onUpdated.forEach((hook) => hook(this.nodes));
      }
    } else {
      this.scope = void 0;
      this.nodes = [];
    }
  }
};
var SlotFragment = class extends DynamicFragment {
  constructor() {
    super(isHydrating$1 || true ? "slot" : void 0);
  }
  updateSlot(render2, fallback, key = render2) {
    if (!render2 || !fallback) {
      this.update(render2 || fallback, key);
      return;
    }
    const wrapped = () => {
      const block = render2();
      const emptyFrag = attachSlotFallback(block, fallback);
      if (!isValidBlock(block)) return renderSlotFallback(block, fallback, emptyFrag);
      return block;
    };
    this.update(wrapped, key);
  }
};
function isFragment(val) {
  return val instanceof VaporFragment;
}
function isDynamicFragment(val) {
  return val instanceof DynamicFragment;
}
function renderSlotFallback(block, fallback, emptyFragment) {
  const frag = emptyFragment || findDeepestEmptyFragment(block);
  if (frag) {
    if (frag instanceof ForFragment) frag.nodes[0] = [fallback() || []];
    else if (frag instanceof DynamicFragment) frag.update(fallback);
    return block;
  }
  return fallback();
}
function attachSlotFallback(block, fallback) {
  const state = { emptyFrag: null };
  traverseForFallback(block, fallback, state);
  return state.emptyFrag;
}
var slotFallbackState = /* @__PURE__ */ new WeakMap();
function traverseForFallback(block, fallback, state) {
  if (isVaporComponent2(block)) {
    if (block.block) traverseForFallback(block.block, fallback, state);
    return;
  }
  if (isArray(block)) {
    for (const item of block) traverseForFallback(item, fallback, state);
    return;
  }
  if (block instanceof ForFragment) {
    block.fallback = chainFallback(block.fallback, fallback);
    if (!isValidBlock(block.nodes)) state.emptyFrag = block;
    traverseForFallback(block.nodes, fallback, state);
    return;
  }
  if (block instanceof VaporFragment && block.insert) {
    block.fallback = chainFallback(block.fallback, fallback);
    if (!isValidBlock(block.nodes)) state.emptyFrag = block;
    traverseForFallback(block.nodes, fallback, state);
    return;
  }
  if (block instanceof DynamicFragment) {
    let slotState = slotFallbackState.get(block);
    if (slotState) slotState.fallback = chainFallback(slotState.fallback, fallback);
    else slotFallbackState.set(block, slotState = {
      fallback,
      wrapped: false
    });
    if (!slotState.wrapped) {
      slotState.wrapped = true;
      const original = block.update.bind(block);
      block.update = (render2, key) => {
        original(render2, key);
        const emptyFrag = attachSlotFallback(block.nodes, slotState.fallback);
        if (render2 !== slotState.fallback && !isValidBlock(block.nodes)) renderSlotFallback(block, slotState.fallback, emptyFrag);
      };
    }
    if (!isValidBlock(block.nodes)) state.emptyFrag = block;
    traverseForFallback(block.nodes, fallback, state);
  }
}
function findDeepestEmptyFragment(block) {
  let emptyFrag = null;
  traverseForEmptyFragment(block, (frag) => emptyFrag = frag);
  return emptyFrag;
}
function traverseForEmptyFragment(block, onFound) {
  if (isVaporComponent2(block)) {
    if (block.block) traverseForEmptyFragment(block.block, onFound);
    return;
  }
  if (isArray(block)) {
    for (const item of block) traverseForEmptyFragment(item, onFound);
    return;
  }
  if (isFragment(block)) {
    if (!isValidBlock(block.nodes)) onFound(block);
    traverseForEmptyFragment(block.nodes, onFound);
  }
}
function chainFallback(existing, next2) {
  if (!existing) return next2;
  return (...args) => {
    const res = existing(...args);
    return !isValidBlock(res) ? next2(...args) : res;
  };
}
function setKey(block, key) {
  if (block instanceof Node) block.$key = key;
  else if (isVaporComponent2(block)) {
    block.key = key;
    setKey(block.block, key);
  } else if (isArray(block)) for (const b of block) setKey(b, key);
  else {
    block.$key = key;
    setKey(block.nodes, key);
  }
}
var VaporTeleportImpl = {
  name: "VaporTeleport",
  __isTeleport: true,
  __vapor: true,
  process(props, slots) {
    return new TeleportFragment(props, slots);
  }
};
var TeleportFragment = class extends VaporFragment {
  constructor(props, slots) {
    super([]);
    this.__isTeleportFragment = true;
    this.isMounted = false;
    this.insert = (container, anchor) => {
      if (isHydrating$1) return;
      this.placeholder = true ? createComment("teleport start") : createTextNode();
      insert(this.placeholder, container, anchor);
      insert(this.anchor, container, anchor);
      this.handlePropsUpdate();
    };
    this.remove = (parent = this.parent) => {
      if (this.nodes) {
        remove2(this.nodes, this.mountContainer);
        this.nodes = [];
      }
      this.isMounted = false;
      if (this.targetStart) {
        remove2(this.targetStart, this.target);
        this.targetStart = void 0;
        remove2(this.targetAnchor, this.target);
        this.targetAnchor = void 0;
      }
      if (this.anchor) {
        remove2(this.anchor, this.anchor.parentNode);
        this.anchor = void 0;
      }
      if (this.placeholder) {
        remove2(this.placeholder, parent);
        this.placeholder = void 0;
      }
      this.mountContainer = void 0;
      this.mountAnchor = void 0;
    };
    this.hydrate = () => {
      if (!isHydrating$1) return;
      const target = this.target = resolveTarget(this.resolvedProps, querySelector);
      const disabled = isTeleportDisabled(this.resolvedProps);
      this.placeholder = currentHydrationNode;
      if (target) {
        const targetNode = target._lpa || target.firstChild;
        if (disabled) this.hydrateDisabledTeleport(targetNode);
        else {
          this.anchor = locateTeleportEndAnchor();
          this.mountContainer = target;
          let targetAnchor = targetNode;
          while (targetAnchor) {
            if (targetAnchor && targetAnchor.nodeType === 8) {
              if (targetAnchor.data === "teleport start anchor") this.targetStart = targetAnchor;
              else if (targetAnchor.data === "teleport anchor") {
                this.mountAnchor = this.targetAnchor = targetAnchor;
                target._lpa = this.targetAnchor && this.targetAnchor.nextSibling;
                break;
              }
            }
            targetAnchor = targetAnchor.nextSibling;
          }
          if (targetNode) setCurrentHydrationNode(targetNode.nextSibling);
          if (!this.targetAnchor) this.mountChildren(target);
          else this.initChildren();
        }
      } else if (disabled) this.hydrateDisabledTeleport(currentHydrationNode);
      updateCssVars2(this);
      advanceHydrationNode(this.anchor);
    };
    this.rawProps = props;
    this.rawSlots = slots;
    this.parentComponent = getScopeOwner();
    this.anchor = isHydrating$1 ? void 0 : true ? createComment("teleport end") : createTextNode();
    renderEffect(() => {
      const prevTo = this.resolvedProps && this.resolvedProps.to;
      const wasDisabled = this.isDisabled;
      this.resolvedProps = extend({}, new Proxy(this.rawProps, rawPropsProxyHandlers));
      this.isDisabled = isTeleportDisabled(this.resolvedProps);
      if (wasDisabled !== this.isDisabled || !this.isDisabled && prevTo !== this.resolvedProps.to) this.handlePropsUpdate();
    });
    if (!isHydrating$1) this.initChildren();
  }
  get parent() {
    return this.anchor ? this.anchor.parentNode : null;
  }
  initChildren() {
    renderEffect(() => {
      this.handleChildrenUpdate(this.rawSlots.default && this.rawSlots.default());
    });
    const nodes = this.nodes;
    if (this.parentComponent && this.parentComponent.ut) this.registerUpdateCssVars(nodes);
    if (true) {
      if (isVaporComponent2(nodes)) nodes.parentTeleport = this;
      else if (isArray(nodes)) nodes.forEach((node) => isVaporComponent2(node) && (node.parentTeleport = this));
    }
  }
  registerUpdateCssVars(block) {
    if (isFragment(block)) {
      (block.onUpdated || (block.onUpdated = [])).push(() => updateCssVars2(this));
      this.registerUpdateCssVars(block.nodes);
    } else if (isVaporComponent2(block)) this.registerUpdateCssVars(block.block);
    else if (isArray(block)) block.forEach((node) => this.registerUpdateCssVars(node));
  }
  handleChildrenUpdate(children) {
    if (!this.parent || isHydrating$1) {
      this.nodes = children;
      return;
    }
    remove2(this.nodes, this.mountContainer);
    insert(this.nodes = children, this.mountContainer, this.mountAnchor);
  }
  mount(parent, anchor) {
    if (this.$transition && !this.isMounted) applyTransitionHooks(this.nodes, this.$transition);
    if (this.isMounted) move(this.nodes, this.mountContainer = parent, this.mountAnchor = anchor, 2);
    else {
      insert(this.nodes, this.mountContainer = parent, this.mountAnchor = anchor);
      this.isMounted = true;
    }
  }
  mountToTarget() {
    const target = this.target = resolveTarget(this.resolvedProps, querySelector);
    if (target) {
      if (!this.targetAnchor || this.targetAnchor.parentNode !== target) {
        insert(this.targetStart = createTextNode(""), target);
        insert(this.targetAnchor = createTextNode(""), target);
      }
      if (this.parentComponent && this.parentComponent.isCE) (this.parentComponent.ce._teleportTargets || (this.parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
      this.mount(target, this.targetAnchor);
      updateCssVars2(this);
    } else if (true) warn2(`Invalid Teleport target on ${this.targetAnchor ? "update" : "mount"}:`, target, `(${typeof target})`);
  }
  handlePropsUpdate() {
    if (!this.parent || isHydrating$1) return;
    if (this.isDisabled) {
      this.mount(this.parent, this.anchor);
      updateCssVars2(this);
    } else if (isTeleportDeferred(this.resolvedProps) || !this.parent.isConnected) queuePostFlushCb(this.mountToTarget.bind(this));
    else this.mountToTarget();
  }
  hydrateDisabledTeleport(targetNode) {
    if (!isHydrating$1) return;
    let nextNode = this.placeholder.nextSibling;
    setCurrentHydrationNode(nextNode);
    this.mountAnchor = this.anchor = locateTeleportEndAnchor(nextNode);
    this.mountContainer = this.anchor.parentNode;
    this.targetStart = targetNode;
    this.targetAnchor = targetNode && targetNode.nextSibling;
    this.initChildren();
  }
  mountChildren(target) {
    if (!isHydrating$1) return;
    target.appendChild(this.targetStart = createTextNode(""));
    target.appendChild(this.mountAnchor = this.targetAnchor = createTextNode(""));
    if (!isMismatchAllowed(target, 1)) {
      if (true) warn2(`Hydration children mismatch on`, target, `
Server rendered element contains fewer child nodes than client nodes.`);
      logMismatchError2();
    }
    runWithoutHydration(this.initChildren.bind(this));
  }
};
var VaporTeleport = VaporTeleportImpl;
function isVaporTeleport(value) {
  return !!(value && value.__isTeleport && value.__vapor);
}
function isTeleportFragment(value) {
  return !!(value && value.__isTeleportFragment);
}
function locateTeleportEndAnchor(node = currentHydrationNode) {
  while (node) {
    if (isComment2(node, "teleport end")) return node;
    node = node.nextSibling;
  }
  return null;
}
function updateCssVars2(frag) {
  const ctx = frag.parentComponent;
  if (ctx && ctx.ut) {
    let node, anchor;
    if (frag.isDisabled) {
      node = frag.placeholder;
      anchor = frag.anchor;
    } else {
      node = frag.targetStart;
      anchor = frag.targetAnchor;
    }
    while (node && node !== anchor) {
      if (node.nodeType === 1) node.setAttribute("data-v-owner", String(ctx.uid));
      node = node.nextSibling;
    }
    ctx.ut();
  }
}
function isBlock(val) {
  return val instanceof Node || isArray(val) || isVaporComponent2(val) || isFragment(val);
}
function isValidBlock(block) {
  if (block instanceof Node) return !(block instanceof Comment);
  else if (isVaporComponent2(block)) return isValidBlock(block.block);
  else if (isArray(block)) return block.length > 0 && block.some(isValidBlock);
  else return isValidBlock(block.nodes);
}
function insert(block, parent, anchor = null, parentSuspense2) {
  anchor = anchor === 0 ? parent.$fc || _child(parent) : anchor;
  if (block instanceof Node) {
    if (!isHydrating$1) if (block instanceof Element && block.$transition && !block.$transition.disabled) performTransitionEnter(block, block.$transition, () => parent.insertBefore(block, anchor), parentSuspense2);
    else parent.insertBefore(block, anchor);
  } else if (isVaporComponent2(block)) if (block.isMounted && !block.isDeactivated) insert(block.block, parent, anchor);
  else mountComponent(block, parent, anchor);
  else if (isArray(block)) for (const b of block) insert(b, parent, anchor);
  else {
    if (block.anchor) {
      insert(block.anchor, parent, anchor);
      anchor = block.anchor;
    }
    if (block.insert) block.insert(parent, anchor, block.$transition);
    else insert(block.nodes, parent, anchor, parentSuspense2);
  }
}
function move(block, parent, anchor = null, moveType = 1, parentComponent, parentSuspense2) {
  anchor = anchor === 0 ? parent.$fc || _child(parent) : anchor;
  if (block instanceof Node) if (block instanceof Element && block.$transition && !block.$transition.disabled && moveType !== 2) if (moveType === 0) performTransitionEnter(block, block.$transition, () => parent.insertBefore(block, anchor), parentSuspense2, true);
  else performTransitionLeave(block, block.$transition, () => {
    if (moveType === 1 && parentComponent && parentComponent.isUnmounted) block.remove();
    else parent.insertBefore(block, anchor);
  }, parentSuspense2, true);
  else parent.insertBefore(block, anchor);
  else if (isVaporComponent2(block)) if (block.isMounted) move(block.block, parent, anchor, moveType, parentComponent, parentSuspense2);
  else mountComponent(block, parent, anchor);
  else if (isArray(block)) for (const b of block) move(b, parent, anchor, moveType, parentComponent, parentSuspense2);
  else {
    if (block.anchor) {
      move(block.anchor, parent, anchor, moveType, parentComponent, parentSuspense2);
      anchor = block.anchor;
    }
    if (block.insert) block.insert(parent, anchor, block.$transition);
    else move(block.nodes, parent, anchor, moveType, parentComponent, parentSuspense2);
  }
}
function prepend(parent, ...blocks) {
  let i = blocks.length;
  while (i--) insert(blocks[i], parent, 0);
}
function remove2(block, parent) {
  if (block instanceof Node) if (block.$transition && block instanceof Element) performTransitionLeave(block, block.$transition, () => parent && parent.removeChild(block));
  else parent && parent.removeChild(block);
  else if (isVaporComponent2(block)) unmountComponent(block, parent);
  else if (isArray(block)) for (let i = 0; i < block.length; i++) remove2(block[i], parent);
  else {
    if (block.remove) block.remove(parent, block.$transition);
    else remove2(block.nodes, parent);
    if (block.anchor) remove2(block.anchor, parent);
    if (block.scope) block.scope.stop();
  }
}
function normalizeBlock(block) {
  if (false) throw new Error("normalizeBlock should not be used in production code paths");
  const nodes = [];
  if (block instanceof Node) nodes.push(block);
  else if (isArray(block)) block.forEach((child2) => nodes.push(...normalizeBlock(child2)));
  else if (isVaporComponent2(block)) nodes.push(...normalizeBlock(block.block));
  else if (isTeleportFragment(block)) nodes.push(block.placeholder, block.anchor);
  else {
    nodes.push(...normalizeBlock(block.nodes));
    block.anchor && nodes.push(block.anchor);
  }
  return nodes;
}
function findBlockNode(block) {
  let { parentNode: parentNode2, nextSibling: nextNode } = findLastChild(block);
  if (nextNode && isComment2(nextNode, "]") && isFragmentBlock(block)) nextNode = nextNode.nextSibling;
  return {
    parentNode: parentNode2,
    nextNode
  };
}
function findLastChild(node) {
  if (node && node instanceof Node) return node;
  else if (isArray(node)) return findLastChild(node[node.length - 1]);
  else if (isVaporComponent2(node)) return findLastChild(node.block);
  else {
    if (node.anchor) return node.anchor;
    return findLastChild(node.nodes);
  }
}
function isFragmentBlock(block) {
  if (isArray(block)) return true;
  else if (isVaporComponent2(block)) return isFragmentBlock(block.block);
  else if (isFragment(block)) return isFragmentBlock(block.nodes);
  return false;
}
function setScopeId(block, scopeIds) {
  if (block instanceof Element) for (const id of scopeIds) block.setAttribute(id, "");
  else if (isVaporComponent2(block)) setScopeId(block.block, scopeIds);
  else if (isArray(block)) for (const b of block) setScopeId(b, scopeIds);
  else if (isFragment(block)) setScopeId(block.nodes, scopeIds);
}
function setComponentScopeId(instance) {
  const { parent, scopeId } = instance;
  if (!parent || !scopeId) return;
  if (isArray(instance.block) && instance.block.length > 1) return;
  const scopeIds = [];
  const parentScopeId = parent && parent.type.__scopeId;
  if (parentScopeId !== scopeId) scopeIds.push(scopeId);
  else if (parentScopeId) scopeIds.push(parentScopeId);
  if (parent.subTree && parent.subTree.component === instance && parent.vnode.scopeId) {
    scopeIds.push(parent.vnode.scopeId);
    const inheritedScopeIds = getInheritedScopeIds(parent.vnode, parent.parent);
    scopeIds.push(...inheritedScopeIds);
  }
  if (scopeIds.length > 0) setScopeId(instance.block, scopeIds);
}
var _applyTransitionHooks;
var _applyTransitionLeaveHooks;
function registerTransitionHooks(applyHooks, applyLeaveHooks) {
  _applyTransitionHooks = applyHooks;
  _applyTransitionLeaveHooks = applyLeaveHooks;
}
function applyTransitionHooks(block, hooks) {
  return _applyTransitionHooks ? _applyTransitionHooks(block, hooks) : hooks;
}
function applyTransitionLeaveHooks(block, enterHooks, afterLeaveCb) {
  _applyTransitionLeaveHooks && _applyTransitionLeaveHooks(block, enterHooks, afterLeaveCb);
}
function hmrRerender(instance) {
  const normalized = normalizeBlock(instance.block);
  const parent = normalized[0].parentNode;
  const anchor = normalized[normalized.length - 1].nextSibling;
  instance.scope.reset();
  remove2(instance.block, parent);
  const prev = setCurrentInstance(instance);
  pushWarningContext(instance);
  devRender(instance);
  popWarningContext();
  setCurrentInstance(...prev);
  insert(instance.block, parent, anchor);
}
function hmrReload(instance, newComp) {
  if (instance.parent && isKeepAlive(instance.parent)) {
    instance.parent.hmrRerender();
    return;
  }
  const normalized = normalizeBlock(instance.block);
  const parent = normalized[0].parentNode;
  const anchor = normalized[normalized.length - 1].nextSibling;
  unmountComponent(instance, parent);
  const parentInstance = instance.parent;
  const prev = setCurrentInstance(parentInstance);
  const newInstance = createComponent(newComp, instance.rawProps, instance.rawSlots, instance.isSingleRoot);
  setCurrentInstance(...prev);
  mountComponent(newInstance, parent, anchor);
  updateParentBlockOnHmrReload(parentInstance, instance, newInstance);
  updateParentTeleportOnHmrReload(instance, newInstance);
}
function updateParentBlockOnHmrReload(parentInstance, instance, newInstance) {
  if (parentInstance) {
    if (parentInstance.block === instance) parentInstance.block = newInstance;
    else if (isArray(parentInstance.block)) {
      for (let i = 0; i < parentInstance.block.length; i++) if (parentInstance.block[i] === instance) {
        parentInstance.block[i] = newInstance;
        break;
      }
    }
  }
}
function updateParentTeleportOnHmrReload(instance, newInstance) {
  const teleport = instance.parentTeleport;
  if (teleport) {
    newInstance.parentTeleport = teleport;
    if (teleport.nodes === instance) teleport.nodes = newInstance;
    else if (isArray(teleport.nodes)) {
      for (let i = 0; i < teleport.nodes.length; i++) if (teleport.nodes[i] === instance) {
        teleport.nodes[i] = newInstance;
        break;
      }
    }
  }
}
function createComponent(component, rawProps, rawSlots, isSingleRoot, once, appContext = currentInstance && currentInstance.appContext || emptyContext) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (isHydrating$1) locateHydrationNode();
  else resetInsertionState();
  let prevSuspense = null;
  if (currentInstance && currentInstance.suspense) prevSuspense = setParentSuspense(currentInstance.suspense);
  if ((isSingleRoot || currentInstance && isVaporTransition(currentInstance.type)) && component.inheritAttrs !== false && isVaporComponent2(currentInstance) && currentInstance.hasFallthrough) {
    const attrs = currentInstance.attrs;
    if (rawProps && rawProps !== EMPTY_OBJ) (rawProps.$ || (rawProps.$ = [])).push(() => attrs);
    else rawProps = { $: [() => attrs] };
  }
  if (currentInstance && currentInstance.vapor && isKeepAlive(currentInstance)) {
    const cached = currentInstance.ctx.getCachedComponent(component);
    if (cached) return cached;
  }
  if (isInteropEnabled && appContext.vapor && !component.__vapor) {
    const frag = appContext.vapor.vdomMount(component, currentInstance, rawProps, rawSlots, isSingleRoot);
    if (!isHydrating$1) {
      if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
    } else {
      frag.hydrate();
      if (_isLastInsertion) advanceHydrationNode(_insertionParent);
    }
    return frag;
  }
  if (isVaporTeleport(component)) {
    const frag = component.process(rawProps, rawSlots);
    if (!isHydrating$1) {
      if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
    } else {
      frag.hydrate();
      if (_isLastInsertion) advanceHydrationNode(_insertionParent);
    }
    return frag;
  }
  const instance = new VaporComponentInstance(component, rawProps, rawSlots, appContext, once);
  if (currentKeepAliveCtx && !isAsyncWrapper(instance)) {
    currentKeepAliveCtx.processShapeFlag(instance);
    setCurrentKeepAliveCtx(null);
  }
  const prevSlotOwner = setCurrentSlotOwner(null);
  if (true) {
    registerHMR(instance);
    instance.isSingleRoot = isSingleRoot;
    instance.hmrRerender = hmrRerender.bind(null, instance);
    instance.hmrReload = hmrReload.bind(null, instance);
    pushWarningContext(instance);
    startMeasure(instance, `init`);
    instance.propsOptions = normalizePropsOptions2(component);
    instance.emitsOptions = normalizeEmitsOptions2(component);
  }
  if (isHydrating$1 && isAsyncWrapper(instance) && component.__asyncHydrate && !component.__asyncResolved) component.__asyncHydrate(currentHydrationNode, instance, () => setupComponent2(instance, component));
  else setupComponent2(instance, component);
  if (true) {
    popWarningContext();
    endMeasure(instance, "init");
  }
  if (currentInstance && currentInstance.suspense) setParentSuspense(prevSuspense);
  setCurrentSlotOwner(prevSlotOwner);
  onScopeDispose(() => unmountComponent(instance), true);
  if (_insertionParent || isHydrating$1) mountComponent(instance, _insertionParent, _insertionAnchor);
  if (isHydrating$1 && _insertionAnchor !== void 0) advanceHydrationNode(_insertionParent);
  return instance;
}
function setupComponent2(instance, component) {
  const prevInstance = setCurrentInstance(instance);
  const prevSub = setActiveSub();
  if (true) setupPropsValidation(instance);
  const setupFn = isFunction(component) ? component : component.setup;
  const setupResult = setupFn ? callWithErrorHandling(setupFn, instance, 0, [instance.props, instance]) || EMPTY_OBJ : EMPTY_OBJ;
  const isAsyncSetup = isPromise(setupResult);
  if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
  if (isAsyncSetup) {
    instance.asyncDep = setupResult;
    if (!instance.suspense) {
      var _getComponentName;
      warn2(`Component <${(_getComponentName = getComponentName(component)) !== null && _getComponentName !== void 0 ? _getComponentName : "Anonymous"}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
    }
  } else handleSetupResult2(setupResult, component, instance);
  setActiveSub(prevSub);
  setCurrentInstance(...prevInstance);
}
var isApplyingFallthroughProps = false;
function applyFallthroughProps(el, attrs) {
  isApplyingFallthroughProps = true;
  setDynamicProps(el, [attrs]);
  isApplyingFallthroughProps = false;
}
function createDevSetupStateProxy(instance) {
  const { setupState } = instance;
  return new Proxy(setupState, { get(target, key, receiver) {
    if (isString(key) && !key.startsWith("__v") && !hasOwn(toRaw(setupState), key)) warn2(`Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`);
    return Reflect.get(target, key, receiver);
  } });
}
function devRender(instance) {
  instance.block = (instance.type.render ? callWithErrorHandling(instance.type.render, instance, 1, [
    instance.setupState,
    instance.props,
    instance.emit,
    instance.attrs,
    instance.slots
  ]) : callWithErrorHandling(isFunction(instance.type) ? instance.type : instance.type.setup, instance, 0, [instance.props, {
    slots: instance.slots,
    attrs: instance.attrs,
    emit: instance.emit,
    expose: instance.expose
  }])) || [];
}
var emptyContext = {
  app: null,
  config: {},
  provides: /* @__PURE__ */ Object.create(null)
};
var VaporComponentInstance = class {
  constructor(comp, rawProps, rawSlots, appContext, once) {
    this.accessedAttrs = false;
    this.vapor = true;
    this.uid = nextUid();
    this.type = comp;
    this.parent = currentInstance;
    if (currentInstance) {
      this.root = currentInstance.root;
      this.appContext = currentInstance.appContext;
      this.provides = currentInstance.provides;
      this.ids = currentInstance.ids;
    } else {
      this.root = this;
      this.appContext = appContext || emptyContext;
      this.provides = Object.create(this.appContext.provides);
      this.ids = [
        "",
        0,
        0
      ];
    }
    this.block = null;
    this.scope = new EffectScope(true);
    this.emit = emit2.bind(null, this);
    this.expose = expose.bind(null, this);
    this.refs = EMPTY_OBJ;
    this.emitted = this.exposed = this.exposeProxy = this.propsDefaults = null;
    this.suspense = parentSuspense;
    this.suspenseId = parentSuspense ? parentSuspense.pendingId : 0;
    this.asyncDep = null;
    this.asyncResolved = false;
    this.isMounted = this.isUnmounted = this.isUpdating = this.isDeactivated = false;
    this.rawProps = rawProps || EMPTY_OBJ;
    this.hasFallthrough = hasFallthroughAttrs(comp, rawProps);
    if (rawProps || comp.props) {
      const [propsHandlers, attrsHandlers] = getPropsProxyHandlers(comp, once);
      this.attrs = new Proxy(this, attrsHandlers);
      this.props = comp.props ? new Proxy(this, propsHandlers) : isFunction(comp) ? this.attrs : EMPTY_OBJ;
    } else this.props = this.attrs = EMPTY_OBJ;
    this.rawSlots = rawSlots || EMPTY_OBJ;
    this.slots = rawSlots ? rawSlots.$ ? new Proxy(rawSlots, dynamicSlotsProxyHandlers) : rawSlots : EMPTY_OBJ;
    this.scopeId = getCurrentScopeId();
    if (comp.ce) comp.ce(this);
    if (true) if (this.props === this.attrs) this.accessedAttrs = true;
    else {
      const attrs = this.attrs;
      const instance = this;
      this.attrs = new Proxy(attrs, { get(target, key, receiver) {
        instance.accessedAttrs = true;
        return Reflect.get(target, key, receiver);
      } });
    }
  }
  /**
  * Expose `getKeysFromRawProps` on the instance so it can be used in code
  * paths where it's needed, e.g. `useModel`
  */
  rawKeys() {
    return getKeysFromRawProps(this.rawProps);
  }
};
function isVaporComponent2(value) {
  return value instanceof VaporComponentInstance;
}
function createComponentWithFallback(comp, rawProps, rawSlots, isSingleRoot, once, appContext) {
  if (comp === NULL_DYNAMIC_COMPONENT) return true ? createComment("ndc") : createTextNode("");
  if (!isString(comp)) return createComponent(comp, rawProps, rawSlots, isSingleRoot, once, appContext);
  return createPlainElement(comp, rawProps, rawSlots, isSingleRoot, once);
}
function createPlainElement(comp, rawProps, rawSlots, isSingleRoot, once) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (isHydrating$1) locateHydrationNode();
  else resetInsertionState();
  const el = isHydrating$1 ? adoptTemplate(currentHydrationNode, `<${comp}/>`) : createElement(comp);
  el.$root = isSingleRoot;
  if (!isHydrating$1) {
    const scopeId = getCurrentScopeId();
    if (scopeId) setScopeId(el, [scopeId]);
  }
  if (rawProps) {
    const setFn = () => setDynamicProps(el, [resolveDynamicProps(rawProps)]);
    if (once) setFn();
    else renderEffect(setFn);
  }
  if (rawSlots) {
    let nextNode = null;
    if (isHydrating$1) {
      nextNode = locateNextNode(el);
      setCurrentHydrationNode(el.firstChild);
    }
    if (rawSlots.$) {
      const frag = new DynamicFragment(isHydrating$1 ? "" : true ? "slot" : void 0);
      renderEffect(() => frag.update(getSlot(rawSlots, "default")));
      if (!isHydrating$1) insert(frag, el);
    } else {
      let slot = getSlot(rawSlots, "default");
      if (slot) {
        const block = slot();
        if (!isHydrating$1) insert(block, el);
      }
    }
    if (isHydrating$1) setCurrentHydrationNode(nextNode);
  }
  if (!isHydrating$1) {
    if (_insertionParent) insert(el, _insertionParent, _insertionAnchor);
  } else if (_isLastInsertion) advanceHydrationNode(_insertionParent);
  return el;
}
function mountComponent(instance, parent, anchor) {
  if (instance.suspense && instance.asyncDep && !instance.asyncResolved) {
    const component = instance.type;
    instance.suspense.registerDep(instance, (setupResult) => {
      handleSetupResult2(setupResult, component, instance);
      mountComponent(instance, parent, anchor);
    });
    return;
  }
  if (instance.shapeFlag & 512) {
    instance.parent.ctx.activate(instance, parent, anchor);
    return;
  }
  const { root, type } = instance;
  if (root && root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type);
  if (true) startMeasure(instance, `mount`);
  if (instance.bm) invokeArrayFns(instance.bm);
  if (!isHydrating$1) {
    insert(instance.block, parent, anchor);
    setComponentScopeId(instance);
  }
  if (instance.m) queuePostFlushCb(instance.m);
  if (instance.shapeFlag & 256 && instance.a) queuePostFlushCb(instance.a);
  instance.isMounted = true;
  if (true) endMeasure(instance, `mount`);
}
function unmountComponent(instance, parentNode2) {
  if (instance.shapeFlag & 256 && instance.parent && instance.parent.vapor) {
    if (parentNode2) instance.parent.ctx.deactivate(instance);
    return;
  }
  if (instance.isMounted && !instance.isUnmounted) {
    if (true) unregisterHMR(instance);
    if (instance.bum) invokeArrayFns(instance.bum);
    instance.scope.stop();
    if (instance.um) queuePostFlushCb(instance.um);
    instance.isUnmounted = true;
  }
  if (parentNode2) remove2(instance.block, parentNode2);
}
function getExposed(instance) {
  if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(markRaw(instance.exposed), { get: (target, key) => unref(target[key]) }));
}
function getRootElement(block, onDynamicFragment, recurse = true) {
  if (block instanceof Element) return block;
  if (recurse && isVaporComponent2(block)) return getRootElement(block.block, onDynamicFragment, recurse);
  if (isFragment(block) && !isTeleportFragment(block)) {
    if (block instanceof DynamicFragment && onDynamicFragment) onDynamicFragment(block);
    const { nodes } = block;
    if (nodes instanceof Element && nodes.$root) return nodes;
    return getRootElement(nodes, onDynamicFragment, recurse);
  }
  if (isArray(block)) {
    let singleRoot;
    let hasComment = false;
    for (const b of block) {
      if (b instanceof Comment) {
        hasComment = true;
        continue;
      }
      const thisRoot = getRootElement(b, onDynamicFragment, recurse);
      if (!thisRoot || singleRoot) return;
      singleRoot = thisRoot;
    }
    return hasComment ? singleRoot : void 0;
  }
}
function isVaporTransition(component) {
  return getComponentName(component) === "VaporTransition";
}
function handleSetupResult2(setupResult, component, instance) {
  if (true) pushWarningContext(instance);
  if (!isBlock(setupResult)) if (isFunction(component)) {
    warn2(`Functional vapor component must return a block directly.`);
    instance.block = [];
  } else if (!component.render) {
    warn2(`Vapor component setup() returned non-block value, and has no render function.`);
    instance.block = [];
  } else {
    if (true) instance.devtoolsRawSetupState = setupResult;
    instance.setupState = proxyRefs(setupResult);
    if (true) instance.setupState = createDevSetupStateProxy(instance);
    devRender(instance);
  }
  else if (setupResult === EMPTY_OBJ && component.render) instance.block = callWithErrorHandling(component.render, instance, 1);
  else instance.block = setupResult;
  if (instance.hasFallthrough && component.inheritAttrs !== false && Object.keys(instance.attrs).length) {
    const root = getRootElement(instance.block, (frag) => frag.attrs = instance.attrs, false);
    if (root) renderEffect(() => {
      const attrs = isFunction(component) && !isVaporTransition(component) ? getFunctionalFallthrough(instance.attrs) : instance.attrs;
      if (attrs) applyFallthroughProps(root, attrs);
    });
    else if (!instance.accessedAttrs && isArray(instance.block) && instance.block.length || isTeleportFragment(instance.block)) warnExtraneousAttributes(instance.attrs);
  }
  if (true) popWarningContext();
}
function getCurrentScopeId() {
  const scopeOwner = getScopeOwner();
  return scopeOwner ? scopeOwner.type.__scopeId : void 0;
}
var _createApp;
var mountApp = (app, container) => {
  optimizePropertyLookup();
  if (container.nodeType === 1) {
    if (container.childNodes.length) warn2("mount target container is not empty and will be cleared.");
    container.textContent = "";
  }
  const instance = app._ceComponent || createComponent(app._component, app._props, null, false, false, app._context);
  mountComponent(instance, container);
  flushOnAppMount();
  return instance;
};
var _hydrateApp;
var hydrateApp = (app, container) => {
  optimizePropertyLookup();
  let instance;
  withHydration(container, () => {
    instance = app._ceComponent || createComponent(app._component, app._props, null, false, false, app._context);
    mountComponent(instance, container);
    flushOnAppMount();
  });
  return instance;
};
var unmountApp = (app) => {
  unmountComponent(app._instance, app._container);
};
function prepareApp() {
  initFeatureFlags();
  const target = getGlobalThis();
  target.__VUE__ = true;
  if (true) setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
}
function postPrepareApp(app) {
  app.vapor = true;
  const mount = app.mount;
  app.mount = (container, ...args) => {
    container = normalizeContainer(container);
    const proxy = mount(container, ...args);
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
}
var createVaporApp = (comp, props) => {
  prepareApp();
  if (!_createApp) _createApp = createAppAPI(mountApp, unmountApp, getExposed);
  const app = _createApp(comp, props);
  postPrepareApp(app);
  return app;
};
var createVaporSSRApp = (comp, props) => {
  setIsHydratingEnabled2(true);
  prepareApp();
  if (!_hydrateApp) _hydrateApp = createAppAPI(hydrateApp, unmountApp, getExposed);
  const app = _hydrateApp(comp, props);
  postPrepareApp(app);
  return app;
};
function defineVaporAsyncComponent(source) {
  const { load, getResolvedComp, setPendingRequest, source: { loadingComponent, errorComponent, delay, hydrate: hydrateStrategy, timeout, suspensible = true } } = createAsyncComponentContext(source);
  return defineVaporComponent({
    name: "VaporAsyncComponentWrapper",
    __asyncLoader: load,
    __asyncHydrate(el, instance, hydrate2) {
      if (!isHydrating$1) return;
      if (isComment2(el, "[")) {
        const end = _next(locateEndAnchor(el));
        const block = instance.block = [el];
        let cur = el;
        while (true) {
          let n = _next(cur);
          if (n && n !== end) block.push(cur = n);
          else break;
        }
      } else instance.block = el;
      instance.isMounted = true;
      setCurrentHydrationNode(isComment2(el, "[") ? locateEndAnchor(el) : el.nextSibling);
      let isHydrated = false;
      watch2(() => instance.attrs, () => {
        if (isHydrated) return;
        instance.bu && invokeArrayFns(instance.bu);
        const parent = parentNode(el);
        load().then(() => {
          if (instance.isUnmounted) return;
          hydrate2();
          if (isComment2(el, "[")) {
            const endAnchor = locateEndAnchor(el);
            removeFragmentNodes(el, endAnchor);
            insert(instance.block, parent, endAnchor);
          } else {
            insert(instance.block, parent, el);
            remove2(el, parent);
          }
        });
      }, {
        deep: true,
        once: true
      });
      performAsyncHydrate(el, instance, () => {
        hydrateNode(el, () => {
          hydrate2();
          insert(instance.block, parentNode(el), el);
          isHydrated = true;
        });
      }, getResolvedComp, load, hydrateStrategy);
    },
    get __asyncResolved() {
      return getResolvedComp();
    },
    setup() {
      const instance = currentInstance;
      markAsyncBoundary(instance);
      const frag = true ? new DynamicFragment("async component") : new DynamicFragment();
      let resolvedComp = getResolvedComp();
      if (resolvedComp) {
        frag.update(() => createInnerComp2(resolvedComp, instance, frag));
        return frag;
      }
      const onError = (err) => {
        setPendingRequest(null);
        handleError(err, instance, 13, !errorComponent);
      };
      if (suspensible && instance.suspense) {
      }
      const { loaded, error, delayed } = useAsyncComponentState(delay, timeout, onError);
      load().then(() => {
        loaded.value = true;
      }).catch((err) => {
        onError(err);
        error.value = err;
      });
      renderEffect(() => {
        resolvedComp = getResolvedComp();
        let render2;
        if (loaded.value && resolvedComp) render2 = () => createInnerComp2(resolvedComp, instance, frag);
        else if (error.value && errorComponent) render2 = () => createComponent(errorComponent, { error: () => error.value });
        else if (loadingComponent && !delayed.value) render2 = () => createComponent(loadingComponent);
        frag.update(render2);
        if (frag.keepAliveCtx) frag.keepAliveCtx.cacheBlock();
      });
      return frag;
    }
  });
}
function createInnerComp2(comp, parent, frag) {
  const { rawProps, rawSlots, appContext } = parent;
  return createComponent(comp, rawProps, rawSlots, void 0, void 0, appContext);
}
function defineVaporCustomElement(options, extraOptions, _createApp2) {
  let Comp = defineVaporComponent(options, extraOptions);
  if (isPlainObject(Comp)) Comp = extend({}, Comp, extraOptions);
  class VaporCustomElement extends VaporElement {
    constructor(initialProps) {
      super(Comp, initialProps, _createApp2);
    }
  }
  VaporCustomElement.def = Comp;
  return VaporCustomElement;
}
var defineVaporSSRCustomElement = ((options, extraOptions) => {
  return defineVaporCustomElement(options, extraOptions, createVaporSSRApp);
});
var VaporElement = class extends VueElementBase {
  constructor(def2, props = {}, createAppFn = createVaporApp) {
    super(def2, props, createAppFn);
  }
  _needsHydration() {
    if (this.shadowRoot && this._createApp !== createVaporApp) return true;
    else if (this.shadowRoot) warn2("Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use `defineVaporSSRCustomElement`.");
    return false;
  }
  _mount(def2) {
    if (!def2.name) def2.name = "VaporElement";
    this._app = this._createApp(this._def);
    this._inheritParentContext();
    if (this._def.configureApp) this._def.configureApp(this._app);
    if (this.shadowRoot && this._createApp === createVaporSSRApp) withHydration(this._root, this._createComponent.bind(this));
    else this._createComponent();
    this._app.mount(this._root);
    if (!this.shadowRoot) this._renderSlots();
  }
  _update() {
    if (!this._app) return;
    const renderEffects = this._instance.renderEffects;
    if (renderEffects) renderEffects.forEach((e) => e.run());
  }
  _unmount() {
    this._app.unmount();
    if (this._instance && this._instance.ce) this._instance.ce = void 0;
    this._app = this._instance = null;
  }
  /**
  * Only called when shadowRoot is false
  */
  _updateSlotNodes(replacements) {
    this._updateFragmentNodes(this._instance.block, replacements);
  }
  /**
  * Replace slot nodes with their replace content
  * @internal
  */
  _updateFragmentNodes(block, replacements) {
    if (Array.isArray(block)) {
      block.forEach((item) => this._updateFragmentNodes(item, replacements));
      return;
    }
    if (!isFragment(block)) return;
    const { nodes } = block;
    if (Array.isArray(nodes)) {
      const newNodes = [];
      for (const node of nodes) if (node instanceof HTMLSlotElement) newNodes.push(...replacements.get(node));
      else {
        this._updateFragmentNodes(node, replacements);
        newNodes.push(node);
      }
      block.nodes = newNodes;
    } else if (nodes instanceof HTMLSlotElement) block.nodes = replacements.get(nodes);
    else this._updateFragmentNodes(nodes, replacements);
  }
  _createComponent() {
    this._def.ce = (instance) => {
      this._app._ceComponent = this._instance = instance;
      if (!this.shadowRoot) this._instance.u = [this._renderSlots.bind(this)];
      this._processInstance();
    };
    createComponent(this._def, this._props, void 0, void 0, void 0, this._app._context);
  }
};
var t;
function template(html, root, ns) {
  let node;
  return () => {
    if (isHydrating$1) {
      const adopted = adoptTemplate(currentHydrationNode, html);
      if (root) adopted.$root = true;
      return adopted;
    }
    if (html[0] !== "<") return createTextNode(html);
    if (!node) {
      t = t || document.createElement("template");
      if (ns) {
        const tag = ns === 1 ? "svg" : "math";
        t.innerHTML = `<${tag}>${html}</${tag}>`;
        node = _child(_child(t.content));
      } else {
        t.innerHTML = html;
        node = _child(t.content);
      }
    }
    const ret = node.cloneNode(true);
    if (root) ret.$root = true;
    return ret;
  };
}
function createIf(condition, b1, b2, once, index) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (!isHydrating$1) resetInsertionState();
  let frag;
  if (once) frag = condition() ? b1() : b2 ? b2() : [true ? createComment("if") : createTextNode()];
  else {
    const keyed = index != null;
    frag = isHydrating$1 || true ? new DynamicFragment("if", keyed) : new DynamicFragment(void 0, keyed);
    renderEffect(() => {
      const ok = condition();
      frag.update(ok ? b1 : b2, keyed ? `${index}${ok ? 0 : 1}` : void 0);
    });
  }
  if (!isHydrating$1) {
    if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
  } else if (_isLastInsertion) advanceHydrationNode(_insertionParent);
  return frag;
}
function createKeyedFragment(key, render2) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (!isHydrating$1) resetInsertionState();
  const frag = true ? new DynamicFragment("keyed", true) : new DynamicFragment(void 0, true);
  renderEffect(() => frag.update(render2, key()));
  if (!isHydrating$1) {
    if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
  } else if (_isLastInsertion) advanceHydrationNode(_insertionParent);
  return frag;
}
var ForBlock = class extends VaporFragment {
  constructor(nodes, scope, item, key, index, renderKey) {
    super(nodes);
    this.scope = scope;
    this.itemRef = item;
    this.keyRef = key;
    this.indexRef = index;
    this.key = renderKey;
  }
};
var createFor = (src, renderItem, getKey, flags = 0, setup) => {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _insertionIndex = insertionIndex;
  const _isLastInsertion = isLastInsertion;
  if (isHydrating$1) locateHydrationNode();
  else resetInsertionState();
  let isMounted = false;
  let oldBlocks = [];
  let newBlocks;
  let parent;
  let currentKey;
  let parentAnchor;
  if (!isHydrating$1) parentAnchor = true ? createComment("for") : createTextNode();
  const frag = new ForFragment(oldBlocks);
  const instance = currentInstance;
  const canUseFastRemove = !!(flags & 1);
  const isComponent = !!(flags & 2);
  const selectors = [];
  const slotOwner = currentSlotOwner;
  if (!instance) warn2("createFor() can only be used inside setup()");
  const renderList2 = () => {
    const source = normalizeSource(src());
    const newLength = source.values.length;
    const oldLength = oldBlocks.length;
    newBlocks = new Array(newLength);
    let isFallback = false;
    const prevSub = setActiveSub();
    if (!isMounted) {
      isMounted = true;
      for (let i = 0; i < newLength; i++) {
        const nodes = mount(source, i).nodes;
        if (isHydrating$1) setCurrentHydrationNode(findBlockNode(nodes).nextNode);
      }
      if (isHydrating$1) {
        parentAnchor = newLength === 0 ? currentHydrationNode.nextSibling : currentHydrationNode;
        if (!parentAnchor || parentAnchor && !isComment2(parentAnchor, "]")) throw new Error(`v-for fragment anchor node was not found. this is likely a Vue internal bug.`);
        if (_insertionParent && isComment2(parentAnchor, "]")) {
          parentAnchor.$idx = _insertionIndex || 0;
          _insertionParent.$llc = parentAnchor;
        }
      }
    } else {
      parent = parent || parentAnchor.parentNode;
      if (!oldLength) {
        if (frag.fallback && frag.nodes[0].length > 0) remove2(frag.nodes[0], parent);
        for (let i = 0; i < newLength; i++) mount(source, i);
      } else if (!newLength) {
        for (const selector of selectors) selector.cleanup();
        const doRemove = !canUseFastRemove;
        for (let i = 0; i < oldLength; i++) unmount(oldBlocks[i], doRemove, false);
        if (canUseFastRemove) {
          parent.textContent = "";
          parent.appendChild(parentAnchor);
        }
        if (frag.fallback) {
          insert(frag.nodes[0] = frag.fallback(), parent, parentAnchor);
          isFallback = true;
        }
      } else if (!getKey) {
        const commonLength = Math.min(newLength, oldLength);
        for (let i = 0; i < commonLength; i++) update(newBlocks[i] = oldBlocks[i], getItem(source, i)[0]);
        for (let i = oldLength; i < newLength; i++) mount(source, i);
        for (let i = newLength; i < oldLength; i++) unmount(oldBlocks[i]);
      } else {
        if (true) {
          const keyToIndexMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < newLength; i++) {
            const key = getKey(...getItem(source, i));
            if (key != null) {
              if (keyToIndexMap.has(key)) warn2(`Duplicate keys found during update:`, JSON.stringify(key), `Make sure keys are unique.`);
              keyToIndexMap.set(key, i);
            }
          }
        }
        const commonLength = Math.min(oldLength, newLength);
        const oldKeyIndexPairs = new Array(oldLength);
        const queuedBlocks = new Array(newLength);
        let endOffset = 0;
        let queuedBlocksLength = 0;
        let oldKeyIndexPairsLength = 0;
        while (endOffset < commonLength) {
          const index = newLength - endOffset - 1;
          const item = getItem(source, index);
          const key = getKey(...item);
          const existingBlock = oldBlocks[oldLength - endOffset - 1];
          if (existingBlock.key !== key) break;
          update(existingBlock, ...item);
          newBlocks[index] = existingBlock;
          endOffset++;
        }
        const e1 = commonLength - endOffset;
        const e2 = oldLength - endOffset;
        const e3 = newLength - endOffset;
        for (let i = 0; i < e1; i++) {
          const currentItem = getItem(source, i);
          const currentKey2 = getKey(...currentItem);
          const oldBlock = oldBlocks[i];
          const oldKey = oldBlock.key;
          if (oldKey === currentKey2) update(newBlocks[i] = oldBlock, currentItem[0]);
          else {
            queuedBlocks[queuedBlocksLength++] = [
              i,
              currentItem,
              currentKey2
            ];
            oldKeyIndexPairs[oldKeyIndexPairsLength++] = [oldKey, i];
          }
        }
        for (let i = e1; i < e2; i++) oldKeyIndexPairs[oldKeyIndexPairsLength++] = [oldBlocks[i].key, i];
        for (let i = e1; i < e3; i++) {
          const blockItem = getItem(source, i);
          const blockKey = getKey(...blockItem);
          queuedBlocks[queuedBlocksLength++] = [
            i,
            blockItem,
            blockKey
          ];
        }
        queuedBlocks.length = queuedBlocksLength;
        oldKeyIndexPairs.length = oldKeyIndexPairsLength;
        const oldKeyIndexMap = new Map(oldKeyIndexPairs);
        const opers = new Array(queuedBlocks.length);
        let mountCounter = 0;
        let opersLength = 0;
        for (let i = queuedBlocks.length - 1; i >= 0; i--) {
          const [index, item, key] = queuedBlocks[i];
          const oldIndex = oldKeyIndexMap.get(key);
          if (oldIndex !== void 0) {
            oldKeyIndexMap.delete(key);
            const reusedBlock = newBlocks[index] = oldBlocks[oldIndex];
            update(reusedBlock, ...item);
            opers[opersLength++] = {
              index,
              block: reusedBlock
            };
          } else {
            mountCounter++;
            opers[opersLength++] = {
              source,
              index,
              item,
              key
            };
          }
        }
        const useFastRemove = mountCounter === newLength;
        for (const leftoverIndex of oldKeyIndexMap.values()) unmount(oldBlocks[leftoverIndex], !(useFastRemove && canUseFastRemove), !useFastRemove);
        if (useFastRemove) {
          for (const selector of selectors) selector.cleanup();
          if (canUseFastRemove) {
            parent.textContent = "";
            parent.appendChild(parentAnchor);
          }
        }
        if (opers.length === mountCounter) for (const { source: source2, index, item, key } of opers) mount(source2, index, index < newLength - 1 ? normalizeAnchor(newBlocks[index + 1].nodes) : parentAnchor, item, key);
        else if (opers.length) {
          let anchor = oldBlocks[0];
          let blocksTail;
          for (let i = 0; i < oldLength; i++) {
            const block = oldBlocks[i];
            if (oldKeyIndexMap.has(block.key)) continue;
            block.prevAnchor = anchor;
            anchor = oldBlocks[i + 1];
            if (blocksTail !== void 0) {
              blocksTail.next = block;
              block.prev = blocksTail;
            }
            blocksTail = block;
          }
          for (const action of opers) {
            const { index } = action;
            if (index < newLength - 1) {
              const nextBlock = newBlocks[index + 1];
              let anchorNode = normalizeAnchor(nextBlock.prevAnchor.nodes);
              if (!anchorNode.parentNode) anchorNode = normalizeAnchor(nextBlock.nodes);
              if ("source" in action) {
                const { item, key } = action;
                moveLink(mount(source, index, anchorNode, item, key), nextBlock.prev, nextBlock);
              } else if (action.block.next !== nextBlock) {
                insert(action.block, parent, anchorNode);
                moveLink(action.block, nextBlock.prev, nextBlock);
              }
            } else if ("source" in action) {
              const { item, key } = action;
              const block = mount(source, index, parentAnchor, item, key);
              moveLink(block, blocksTail);
              blocksTail = block;
            } else if (action.block.next !== void 0) {
              let anchorNode = anchor ? normalizeAnchor(anchor.nodes) : parentAnchor;
              if (!anchorNode.parentNode) anchorNode = parentAnchor;
              insert(action.block, parent, anchorNode);
              moveLink(action.block, blocksTail);
              blocksTail = action.block;
            }
          }
          for (const block of newBlocks) block.prevAnchor = block.next = block.prev = void 0;
        }
      }
    }
    if (!isFallback) {
      frag.nodes = [oldBlocks = newBlocks];
      if (parentAnchor) frag.nodes.push(parentAnchor);
    } else oldBlocks = [];
    if (isMounted && frag.onUpdated) frag.onUpdated.forEach((m) => m());
    setActiveSub(prevSub);
  };
  const needKey = renderItem.length > 1;
  const needIndex = renderItem.length > 2;
  const mount = (source, idx, anchor = parentAnchor, [item, key, index] = getItem(source, idx), key2 = getKey && getKey(item, key, index)) => {
    const itemRef = shallowRef(item);
    const keyRef = needKey ? shallowRef(key) : void 0;
    const indexRef = needIndex ? shallowRef(index) : void 0;
    currentKey = key2;
    let nodes;
    let scope;
    if (isComponent) nodes = renderItem(itemRef, keyRef, indexRef);
    else {
      scope = new EffectScope();
      nodes = scope.run(() => renderItem(itemRef, keyRef, indexRef));
    }
    const block = newBlocks[idx] = new ForBlock(nodes, scope, itemRef, keyRef, indexRef, key2);
    if (frag.$transition) applyTransitionHooks(block.nodes, frag.$transition);
    if (parent) insert(block.nodes, parent, anchor);
    return block;
  };
  const update = ({ itemRef, keyRef, indexRef }, newItem, newKey, newIndex) => {
    if (newItem !== itemRef.value) itemRef.value = newItem;
    if (keyRef && newKey !== void 0 && newKey !== keyRef.value) keyRef.value = newKey;
    if (indexRef && newIndex !== void 0 && newIndex !== indexRef.value) indexRef.value = newIndex;
  };
  const unmount = (block, doRemove = true, doDeregister = true) => {
    if (!isComponent) block.scope.stop();
    if (doRemove) remove2(block.nodes, parent);
    if (doDeregister) for (const selector of selectors) selector.deregister(block.key);
  };
  if (setup) setup({ createSelector });
  if (flags & 4) renderList2();
  else renderEffect(() => {
    if (!isMounted) return renderList2();
    const prevOwner = setCurrentSlotOwner(slotOwner);
    try {
      renderList2();
    } finally {
      setCurrentSlotOwner(prevOwner);
    }
  });
  if (!isHydrating$1) {
    if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
  } else advanceHydrationNode(_isLastInsertion ? _insertionParent : parentAnchor);
  return frag;
  function createSelector(source) {
    let operMap = /* @__PURE__ */ new Map();
    let activeKey = source();
    let activeOpers;
    watch(source, (newValue) => {
      if (activeOpers !== void 0) for (const oper of activeOpers) oper();
      queuePostFlushCb(() => {
        activeKey = newValue;
        activeOpers = operMap.get(newValue);
        if (activeOpers !== void 0) for (const oper of activeOpers) oper();
      });
    });
    selectors.push({
      deregister,
      cleanup: cleanup2
    });
    return register;
    function cleanup2() {
      operMap = /* @__PURE__ */ new Map();
      activeOpers = void 0;
    }
    function register(oper) {
      oper();
      let opers = operMap.get(currentKey);
      if (opers !== void 0) opers.push(oper);
      else {
        opers = [oper];
        operMap.set(currentKey, opers);
        if (currentKey === activeKey) activeOpers = opers;
      }
    }
    function deregister(key) {
      operMap.delete(key);
      if (key === activeKey) activeOpers = void 0;
    }
  }
};
function moveLink(block, newPrev, newNext) {
  const { prev: oldPrev, next: oldNext } = block;
  if (oldPrev) oldPrev.next = oldNext;
  if (oldNext) {
    oldNext.prev = oldPrev;
    if (block.prevAnchor !== block) oldNext.prevAnchor = block.prevAnchor;
  }
  if (newPrev) newPrev.next = block;
  if (newNext) newNext.prev = block;
  block.prev = newPrev;
  block.next = newNext;
  block.prevAnchor = block;
}
function createForSlots(rawSource, getSlot2) {
  const source = normalizeSource(rawSource);
  const sourceLength = source.values.length;
  const slots = new Array(sourceLength);
  for (let i = 0; i < sourceLength; i++) slots[i] = getSlot2(...getItem(source, i));
  return slots;
}
function normalizeSource(source) {
  let values = source;
  let needsWrap = false;
  let isReadonlySource = false;
  let keys;
  if (isArray(source)) {
    if (isReactive(source)) {
      needsWrap = !isShallow(source);
      values = shallowReadArray(source);
      isReadonlySource = isReadonly(source);
    }
  } else if (isString(source)) values = source.split("");
  else if (typeof source === "number") {
    if (!Number.isInteger(source)) warn2(`The v-for range expect an integer value but got ${source}.`);
    values = new Array(source);
    for (let i = 0; i < source; i++) values[i] = i + 1;
  } else if (isObject(source)) if (source[Symbol.iterator]) values = Array.from(source);
  else {
    keys = Object.keys(source);
    values = new Array(keys.length);
    for (let i = 0, l = keys.length; i < l; i++) values[i] = source[keys[i]];
  }
  else values = [];
  return {
    values,
    needsWrap,
    isReadonlySource,
    keys
  };
}
function getItem({ keys, values, needsWrap, isReadonlySource }, idx) {
  const value = needsWrap ? isReadonlySource ? toReadonly(toReactive(values[idx])) : toReactive(values[idx]) : values[idx];
  if (keys) return [
    value,
    keys[idx],
    idx
  ];
  else return [
    value,
    idx,
    void 0
  ];
}
function normalizeAnchor(node) {
  if (node instanceof Node) return node;
  else if (isArray(node)) return normalizeAnchor(node[0]);
  else if (isVaporComponent2(node)) return normalizeAnchor(node.block);
  else return normalizeAnchor(node.nodes);
}
function getRestElement(val, keys) {
  const res = {};
  for (const key in val) if (!keys.includes(key)) res[key] = val[key];
  return res;
}
function getDefaultValue(val, defaultVal) {
  return val === void 0 ? defaultVal : val;
}
function isForBlock(block) {
  return block instanceof ForBlock;
}
var refCleanups = /* @__PURE__ */ new WeakMap();
function ensureCleanup(el) {
  let cleanupRef = refCleanups.get(el);
  if (!cleanupRef) {
    refCleanups.set(el, cleanupRef = { fn: NOOP });
    onScopeDispose(() => {
      cleanupRef.fn();
      refCleanups.delete(el);
    });
  }
  return cleanupRef;
}
function createTemplateRefSetter() {
  const instance = currentInstance;
  const oldRefMap = /* @__PURE__ */ new WeakMap();
  const setRefMap = /* @__PURE__ */ new WeakMap();
  return (el, ref2, refFor, refKey) => {
    if (isDynamicFragment(el) || isVaporComponent2(el) && isAsyncWrapper(el)) {
      const frag = isDynamicFragment(el) ? el : el.block;
      const doSet = () => oldRefMap.set(el, setRef$1(instance, el, ref2, oldRefMap.get(el), refFor, refKey));
      const prevSet = setRefMap.get(frag);
      if (prevSet && frag.onUpdated) remove(frag.onUpdated, prevSet);
      (frag.onUpdated || (frag.onUpdated = [])).push(doSet);
      setRefMap.set(frag, doSet);
    }
    const oldRef = setRef$1(instance, el, ref2, oldRefMap.get(el), refFor, refKey);
    oldRefMap.set(el, oldRef);
    return oldRef;
  };
}
function setRef$1(instance, el, ref2, oldRef, refFor = false, refKey) {
  if (!instance || instance.isUnmounted) return;
  if (isInteropEnabled && isFragment(el) && el.setRef) {
    el.setRef(instance, ref2, refFor, refKey);
    return;
  }
  if (isVaporComponent2(el) && isAsyncWrapper(el)) {
    if (!el.type.__asyncResolved) return;
    el = el.block.nodes;
  }
  const setupState = true ? instance.setupState || {} : null;
  const refValue = getRefValue(el);
  const refs = instance.refs === EMPTY_OBJ ? instance.refs = {} : instance.refs;
  const canSetSetupRef = true ? createCanSetSetupRefChecker(setupState, refs) : NO;
  const canSetRef = (ref3, key) => {
    if (knownTemplateRefs.has(ref3)) return false;
    if (key && isTemplateRefKey(refs, key)) return false;
    return true;
  };
  if (oldRef != null && oldRef !== ref2) {
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
    } else if (isRef2(oldRef)) {
      if (canSetRef(oldRef)) oldRef.value = null;
    } else if (isFunction(oldRef) && isDynamicFragment(el)) callWithErrorHandling(oldRef, instance, 12, [null, refs]);
  } else if (oldRef != null && isDynamicFragment(el)) {
    if (isFunction(oldRef)) callWithErrorHandling(oldRef, instance, 12, [null, refs]);
    else if (refFor) {
      const cleanup2 = refCleanups.get(el);
      if (cleanup2) cleanup2.fn();
    }
  }
  if (isFunction(ref2)) {
    const invokeRefSetter = (value) => {
      callWithErrorHandling(ref2, instance, 12, [value, refs]);
    };
    invokeRefSetter(refValue);
    ensureCleanup(el).fn = () => invokeRefSetter(null);
  } else {
    const _isString = isString(ref2);
    const _isRef = isRef2(ref2);
    let existing;
    if (_isString || _isRef) {
      const doSet = () => {
        if (refFor) {
          existing = _isString ? canSetSetupRef(ref2) ? setupState[ref2] : refs[ref2] : canSetRef(ref2) || !refKey ? ref2.value : refs[refKey];
          if (!isArray(existing)) {
            existing = [refValue];
            if (_isString) {
              refs[ref2] = existing;
              if (canSetSetupRef(ref2)) {
                setupState[ref2] = refs[ref2];
                existing = setupState[ref2];
              }
            } else {
              if (canSetRef(ref2, refKey)) ref2.value = existing;
              if (refKey) refs[refKey] = existing;
            }
          } else if (!existing.includes(refValue)) existing.push(refValue);
        } else if (_isString) {
          refs[ref2] = refValue;
          if (canSetSetupRef(ref2)) setupState[ref2] = refValue;
        } else if (_isRef) {
          if (canSetRef(ref2, refKey)) ref2.value = refValue;
          if (refKey) refs[refKey] = refValue;
        } else if (true) warn2("Invalid template ref type:", ref2, `(${typeof ref2})`);
      };
      queuePostFlushCb(doSet, -1);
      ensureCleanup(el).fn = () => {
        queuePostFlushCb(() => {
          if (isArray(existing)) remove(existing, refValue);
          else if (_isString) {
            refs[ref2] = null;
            if (canSetSetupRef(ref2)) setupState[ref2] = null;
          } else if (_isRef) {
            if (canSetRef(ref2, refKey)) ref2.value = null;
            if (refKey) refs[refKey] = null;
          }
        });
      };
    } else if (true) warn2("Invalid template ref type:", ref2, `(${typeof ref2})`);
  }
  return ref2;
}
var getRefValue = (el) => {
  if (isVaporComponent2(el)) return getExposed(el) || el;
  else if (isTeleportFragment(el)) return null;
  else if (isDynamicFragment(el)) {
    if (isArray(el.nodes)) return null;
    return getRefValue(el.nodes);
  }
  return el;
};
function useVaporCssVars(getter) {
  const instance = currentInstance;
  baseUseCssVars(instance, () => resolveParentNode(instance.block), getter, (vars) => setVars(instance, vars));
}
function resolveParentNode(block) {
  if (block instanceof Node) return block.parentNode;
  else if (isArray(block)) return resolveParentNode(block[block.length - 1]);
  else if (isVaporComponent2(block)) return resolveParentNode(block.block);
  else return resolveParentNode(block.anchor || block.nodes);
}
function setVars(instance, vars) {
  if (instance.ce) setVarsOnNode(instance.ce, vars);
  else setVarsOnBlock(instance.block, vars);
}
function setVarsOnBlock(block, vars) {
  if (block instanceof Node) setVarsOnNode(block, vars);
  else if (isArray(block)) block.forEach((child2) => setVarsOnBlock(child2, vars));
  else if (isVaporComponent2(block)) setVarsOnBlock(block.block, vars);
  else if (isTeleportFragment(block)) return;
  else setVarsOnBlock(block.nodes, vars);
}
function createDynamicComponent(getter, rawProps, rawSlots, isSingleRoot, once) {
  const _insertionParent = insertionParent;
  const _insertionAnchor = insertionAnchor;
  const _isLastInsertion = isLastInsertion;
  if (!isHydrating$1) resetInsertionState();
  const frag = isHydrating$1 || true ? new DynamicFragment("dynamic-component") : new DynamicFragment();
  const scopeOwner = getScopeOwner();
  const renderFn = () => {
    const value = getter();
    const appContext = currentInstance && currentInstance.appContext || emptyContext;
    frag.update(() => {
      if (isBlock(value)) return value;
      if (isInteropEnabled && appContext.vapor && isVNode(value)) {
        if (isKeepAlive(currentInstance)) {
          const frag3 = currentInstance.ctx.getCachedComponent(value.type, value.key);
          if (frag3) return frag3;
        }
        const frag2 = appContext.vapor.vdomMountVNode(value, currentInstance);
        if (isHydrating$1) {
          frag2.hydrate();
          if (_isLastInsertion) advanceHydrationNode(_insertionParent);
        }
        return frag2;
      }
      return createComponentWithFallback(withScopeOwner(scopeOwner, () => resolveDynamicComponent(value)), rawProps, rawSlots, isSingleRoot, once, appContext);
    }, value);
  };
  if (once) renderFn();
  else renderEffect(renderFn);
  if (!isHydrating$1) {
    if (_insertionParent) insert(frag, _insertionParent, _insertionAnchor);
  } else if (_isLastInsertion) advanceHydrationNode(_insertionParent);
  return frag;
}
function withScopeOwner(owner, fn) {
  const prev = setCurrentRenderingInstance(owner);
  try {
    return fn();
  } finally {
    setCurrentRenderingInstance(prev);
  }
}
function applyVShow(target, source) {
  if (isVaporComponent2(target)) return applyVShow(target.block, source);
  if (isArray(target) && target.length === 1) return applyVShow(target[0], source);
  if (target instanceof DynamicFragment) {
    const update = target.update;
    target.update = (render2, key) => {
      update.call(target, render2, key);
      setDisplay2(target, source());
    };
  } else if (target instanceof VaporFragment && target.insert) {
    const insert2 = target.insert;
    target.insert = (parent, anchor) => {
      insert2.call(target, parent, anchor);
      setDisplay2(target, source());
    };
  }
  renderEffect(() => setDisplay2(target, source()));
}
function setDisplay2(target, value) {
  if (isVaporComponent2(target)) return setDisplay2(target.block, value);
  if (isArray(target)) {
    if (target.length === 0) return;
    if (target.length === 1) return setDisplay2(target[0], value);
  }
  if (isFragment(target)) return setDisplay2(target.nodes, value);
  if (target instanceof Element) {
    const el = target;
    if (!(vShowOriginalDisplay in el)) el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
    const { $transition } = target;
    if ($transition) if (value) {
      $transition.beforeEnter(target);
      el.style.display = el[vShowOriginalDisplay];
      $transition.enter(target);
    } else if (target.isConnected) $transition.leave(target, () => {
      el.style.display = "none";
    });
    else el.style.display = "none";
    else if (isHydrating$1) {
      if (!value && el.style.display !== "none") {
        warnPropMismatch(el, "style", 3, `display: ${el.style.display}`, "display: none");
        logMismatchError2();
        el.style.display = "none";
        el[vShowOriginalDisplay] = "";
      }
    } else el.style.display = value ? el[vShowOriginalDisplay] : "none";
    el[vShowHidden] = !value;
  } else if (true) warn2("v-show used on component with non-single-element root node and will be ignored.");
}
function ensureMounted(cb) {
  if (currentInstance.isMounted) cb();
  else onMounted(cb);
}
var applyTextModel = (el, get, set, { trim, number, lazy } = {}) => {
  vModelTextInit(el, trim, number, lazy, set);
  ensureMounted(() => {
    let value;
    renderEffect(() => {
      vModelTextUpdate(el, value, value = get(), trim, number, lazy);
    });
  });
};
var applyCheckboxModel = (el, get, set) => {
  vModelCheckboxInit(el, set);
  ensureMounted(() => {
    let value;
    renderEffect(() => {
      vModelCheckboxUpdate(el, value, traverse(value = get()));
    });
  });
};
var applyRadioModel = (el, get, set) => {
  addEventListener2(el, "change", () => set(getValue(el)));
  ensureMounted(() => {
    let value;
    renderEffect(() => {
      if (value !== (value = get())) el.checked = looseEqual(value, getValue(el));
    });
  });
};
var applySelectModel = (el, get, set, modifiers) => {
  vModelSelectInit(el, get(), modifiers && modifiers.number, set);
  ensureMounted(() => {
    renderEffect(() => vModelSetSelected(el, traverse(get())));
  });
};
var applyDynamicModel = (el, get, set, modifiers) => {
  let apply2 = applyTextModel;
  if (el.tagName === "SELECT") apply2 = applySelectModel;
  else if (el.tagName === "TEXTAREA") apply2 = applyTextModel;
  else if (el.type === "checkbox") apply2 = applyCheckboxModel;
  else if (el.type === "radio") apply2 = applyRadioModel;
  apply2(el, get, set, modifiers);
};
function withVaporDirectives(node, dirs) {
  const element = isVaporComponent2(node) ? getRootElement(node.block) : node;
  if (!element) {
    if (true) warn2("Runtime directive used on component with non-element root node. The directives will not function as intended.");
    return;
  }
  for (const [dir, value, argument, modifiers] of dirs) if (dir) {
    const ret = dir(element, value, argument, modifiers);
    if (ret) onScopeDispose(ret);
  }
}
var positionMap2 = /* @__PURE__ */ new WeakMap();
var newPositionMap2 = /* @__PURE__ */ new WeakMap();
var decorate2 = (t2) => {
  delete t2.props.mode;
  return t2;
};
var VaporTransitionGroupImpl = defineVaporComponent({
  name: "VaporTransitionGroup",
  props: extend({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots, expose: expose2 }) {
    expose2();
    ensureTransitionHooksRegistered();
    const instance = currentInstance;
    const state = useTransitionState();
    let cssTransitionProps = resolveTransitionProps(props);
    const propsProxy = new Proxy({}, { get(_, key) {
      return cssTransitionProps[key];
    } });
    renderEffect(() => {
      cssTransitionProps = resolveTransitionProps(props);
    });
    let prevChildren;
    let children;
    const slottedBlock = slots.default && slots.default();
    onBeforeUpdate(() => {
      prevChildren = [];
      children = getTransitionBlocks(slottedBlock);
      if (children) for (let i = 0; i < children.length; i++) {
        const child2 = children[i];
        if (isValidTransitionBlock(child2)) {
          prevChildren.push(child2);
          child2.$transition.disabled = true;
          positionMap2.set(child2, getTransitionElement(child2).getBoundingClientRect());
        }
      }
    });
    onUpdated(() => {
      if (!prevChildren.length) return;
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      const firstChild = getFirstConnectedChild(prevChildren);
      if (!firstChild || !hasCSSTransform(firstChild, firstChild.parentNode, moveClass)) {
        prevChildren = [];
        return;
      }
      prevChildren.forEach(callPendingCbs);
      prevChildren.forEach((child2) => {
        child2.$transition.disabled = false;
        recordPosition2(child2);
      });
      const movedChildren = prevChildren.filter(applyTranslation2);
      forceReflow();
      movedChildren.forEach((c) => handleMovedChildren(getTransitionElement(c), moveClass));
      prevChildren = [];
    });
    setTransitionHooksOnFragment(slottedBlock, {
      props: propsProxy,
      state,
      instance
    });
    children = getTransitionBlocks(slottedBlock);
    for (let i = 0; i < children.length; i++) {
      const child2 = children[i];
      if (isValidTransitionBlock(child2)) {
        if (child2.$key != null) setTransitionHooks$1(child2, resolveTransitionHooks2(child2, propsProxy, state, instance));
        else if (true) warn2(`<transition-group> children must be keyed`);
      }
    }
    const tag = props.tag;
    if (tag) {
      const container = createElement(tag);
      insert(slottedBlock, container);
      return container;
    } else return slottedBlock;
  }
});
var VaporTransitionGroup = decorate2(VaporTransitionGroupImpl);
function getTransitionBlocks(block) {
  let children = [];
  if (block instanceof Node) children.push(block);
  else if (isVaporComponent2(block)) children.push(...getTransitionBlocks(block.block));
  else if (isArray(block)) for (let i = 0; i < block.length; i++) {
    const b = block[i];
    const blocks = getTransitionBlocks(b);
    if (isForBlock(b)) blocks.forEach((block2) => block2.$key = b.key);
    children.push(...blocks);
  }
  else if (isFragment(block)) if (block.insert) children.push(block);
  else children.push(...getTransitionBlocks(block.nodes));
  return children;
}
function isValidTransitionBlock(block) {
  return !!(block instanceof Element || isFragment(block) && block.insert);
}
function getTransitionElement(c) {
  return isFragment(c) ? c.nodes : c;
}
function recordPosition2(c) {
  newPositionMap2.set(c, getTransitionElement(c).getBoundingClientRect());
}
function applyTranslation2(c) {
  if (baseApplyTranslation(positionMap2.get(c), newPositionMap2.get(c), getTransitionElement(c))) return c;
}
function getFirstConnectedChild(children) {
  for (let i = 0; i < children.length; i++) {
    const child2 = children[i];
    const el = getTransitionElement(child2);
    if (el.isConnected) return el;
  }
}

// node_modules/.pnpm/vue@3.6.0-beta.6/node_modules/vue/dist/vue.runtime.esm-bundler.js
function initDev() {
  initCustomFormatter();
}
if (true) initDev();
var compile2 = (_template) => {
  if (true) warn2('Runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".');
  return NOOP;
};

export {
  camelize,
  capitalize,
  toHandlerKey,
  normalizeStyle,
  normalizeClass,
  normalizeProps,
  toDisplayString,
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly,
  isReactive,
  isReadonly,
  isShallow,
  isProxy,
  toRaw,
  markRaw,
  isRef2 as isRef,
  ref,
  shallowRef,
  triggerRef,
  unref,
  toValue,
  proxyRefs,
  customRef,
  toRefs,
  toRef,
  ReactiveEffect,
  effect,
  stop,
  EffectScope,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  TrackOpTypes,
  TriggerOpTypes,
  getCurrentWatcher,
  onWatcherCleanup,
  pushWarningContext,
  popWarningContext,
  assertNumber,
  ErrorCodes,
  callWithErrorHandling,
  callWithAsyncErrorHandling,
  handleError,
  SchedulerJobFlags,
  nextTick,
  queueJob,
  queuePostFlushCb,
  flushOnAppMount,
  registerHMR,
  unregisterHMR,
  devtoolsComponentAdded,
  setCurrentRenderingInstance,
  pushScopeId,
  popScopeId,
  withScopeId,
  withCtx,
  withDirectives,
  provide,
  inject,
  hasInjectionContext,
  ssrContextKey,
  useSSRContext,
  watchEffect,
  watchPostEffect,
  watchSyncEffect,
  watch2 as watch,
  isTeleportDisabled,
  isTeleportDeferred,
  resolveTarget,
  Teleport,
  leaveCbKey,
  useTransitionState,
  BaseTransitionPropsValidators,
  BaseTransition,
  resolveTransitionHooks,
  baseResolveTransitionHooks,
  setTransitionHooks,
  getTransitionRawChildren,
  checkTransitionMode,
  defineComponent,
  useId,
  markAsyncBoundary,
  knownTemplateRefs,
  useTemplateRef,
  isTemplateRefKey,
  setRef,
  createCanSetSetupRefChecker,
  setIsHydratingEnabled,
  isHydrating,
  isTemplateNode,
  getAttributeMismatch,
  isValidHtmlOrSvgAttribute,
  warnPropMismatch,
  toClassSet,
  isSetEqual,
  toStyleMap,
  isMapEqual,
  MismatchTypes,
  isMismatchAllowed,
  hydrateOnIdle,
  hydrateOnVisible,
  hydrateOnMediaQuery,
  hydrateOnInteraction,
  isAsyncWrapper,
  defineAsyncComponent,
  createAsyncComponentContext,
  useAsyncComponentState,
  performAsyncHydrate,
  isKeepAlive,
  KeepAlive,
  matches,
  onActivated,
  onDeactivated,
  resetShapeFlag,
  activate,
  deactivate,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onServerPrefetch,
  onRenderTriggered,
  onRenderTracked,
  onErrorCaptured,
  resolveComponent,
  NULL_DYNAMIC_COMPONENT,
  resolveDynamicComponent,
  resolveDirective,
  renderList,
  createSlots,
  renderSlot,
  ensureVaporSlotFallback,
  toHandlers,
  defineProps,
  defineEmits,
  defineExpose,
  defineOptions,
  defineSlots,
  defineModel,
  withDefaults,
  useSlots,
  useAttrs,
  mergeDefaults,
  mergeModels,
  createPropsRestProxy,
  withAsyncContext,
  createAppAPI,
  useModel,
  baseEmit,
  isEmitListener,
  warnExtraneousAttributes,
  getFunctionalFallthrough,
  createInternalObject,
  resolvePropValue,
  baseNormalizePropsOptions,
  validateProps,
  startMeasure,
  endMeasure,
  initFeatureFlags,
  MoveType,
  createRenderer,
  createHydrationRenderer,
  performTransitionEnter,
  performTransitionLeave,
  getInheritedScopeIds,
  Suspense,
  Fragment,
  Text2 as Text,
  Comment2 as Comment,
  Static,
  openBlock,
  setBlockTracking,
  createElementBlock,
  createBlock,
  isVNode,
  transformVNodeArgs,
  normalizeRef,
  createBaseVNode,
  createVNode,
  guardReactiveProps,
  cloneVNode,
  createTextVNode,
  createStaticVNode,
  createCommentVNode,
  mergeProps,
  currentInstance,
  getCurrentInstance,
  simpleSetCurrentInstance,
  setCurrentInstance,
  useInstanceOption,
  nextUid,
  validateComponentName,
  registerRuntimeCompiler,
  isRuntimeOnly,
  expose,
  getComponentName,
  computed2 as computed,
  h,
  initCustomFormatter,
  withMemo,
  isMemoSame,
  version,
  warn2 as warn,
  ErrorTypeStrings,
  devtools,
  setDevtoolsHook,
  ssrUtils,
  resolveFilter,
  compatUtils,
  DeprecationTypes,
  unsafeToTrustedHTML,
  svgNS,
  nodeOps,
  TransitionPropsValidators,
  Transition,
  resolveTransitionProps,
  forceReflow,
  vShowOriginalDisplay,
  vShowHidden,
  vShow,
  useCssVars,
  baseUseCssVars,
  setVarsOnNode,
  patchStyle,
  xlinkNS,
  patchProp,
  shouldSetAsProp,
  defineCustomElement,
  defineSSRCustomElement,
  VueElementBase,
  VueElement,
  useHost,
  useShadowRoot,
  useCssModule,
  TransitionGroup,
  callPendingCbs,
  baseApplyTranslation,
  hasCSSTransform,
  handleMovedChildren,
  vModelText,
  vModelTextInit,
  vModelTextUpdate,
  vModelCheckbox,
  vModelCheckboxInit,
  vModelCheckboxUpdate,
  vModelRadio,
  vModelSelect,
  vModelSelectInit,
  vModelSetSelected,
  getValue,
  vModelDynamic,
  withModifiers,
  withKeys,
  ensureRenderer,
  ensureHydrationRenderer,
  render,
  hydrate,
  createApp,
  createSSRApp,
  normalizeContainer,
  initDirectivesForSSR,
  setInsertionState,
  createTextNode,
  txt,
  child,
  next,
  nthChild,
  on,
  delegate,
  delegateEvents,
  setDynamicEvents,
  createInvoker2 as createInvoker,
  setProp,
  setAttr,
  setDOMProp,
  setClass,
  setStyle2 as setStyle,
  setValue,
  setText,
  setElementText,
  setBlockText,
  setHtml,
  setBlockHtml,
  setDynamicProps,
  VaporTransition,
  defineVaporComponent,
  VaporKeepAlive,
  vaporInteropPlugin,
  withVaporCtx,
  createSlot,
  renderEffect,
  VaporFragment,
  DynamicFragment,
  isFragment,
  VaporTeleport,
  insert,
  prepend,
  remove2 as remove,
  createComponent,
  isVaporComponent2 as isVaporComponent,
  createComponentWithFallback,
  createPlainElement,
  createVaporApp,
  createVaporSSRApp,
  defineVaporAsyncComponent,
  defineVaporCustomElement,
  defineVaporSSRCustomElement,
  VaporElement,
  template,
  createIf,
  createKeyedFragment,
  createFor,
  createForSlots,
  getRestElement,
  getDefaultValue,
  createTemplateRefSetter,
  useVaporCssVars,
  createDynamicComponent,
  applyVShow,
  applyTextModel,
  applyCheckboxModel,
  applyRadioModel,
  applySelectModel,
  applyDynamicModel,
  withVaporDirectives,
  VaporTransitionGroup,
  compile2 as compile
};
//# sourceMappingURL=chunk-XLXGE5T6.js.map

/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
import {
  React, useState, useEffect, useRef
} from 'react';
import Select from 'react-select';

const OPTIONS_API = 'https://www.atakann.com/demos/psikolog-backend/custom-widget-list';

const Widget = () => {
  const [widgetSettings, _setWidgetSettings] = useState({});
  const [url, _setUrl] = useState('');
  const [selectStyle, setSelectStyle] = useState({
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%'
  });
  const [options, setOptions] = useState([]);
  const [selectedValue, _setSelectedValue] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const widgetRef = useRef(widgetSettings);
  const selectedRef = useRef(selectedValue);
  const urlRef = useRef(url);

  const setUrl = data => {
    urlRef.current = data;
    _setUrl(data);
  };

  const setSelectedValue = data => {
    selectedRef.current = data;
    _setSelectedValue(data);
  };

  const setWidgetSettings = data => {
    widgetRef.current = data;
    _setWidgetSettings(data);
  };

  const renderOptions = () => {
    return options.map(option => {
      if (typeof option === 'string') {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      }
      if (typeof option === 'object') {
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      }

      return (
        <option key="error" value="undefined-option-type"> Undefined Option Type! </option>
      );
    });
  };

  const fetchUrl = uri => {
    setOptions([{
      value: '',
      label: 'Please Wait...'
    }]);
    renderOptions();
    return fetch(uri).then(res => res.json())
      .then(data => {
        return data;
      });
  };

  const handleOptionString = data => {
    var str = data;
    if (widgetRef.current.Select === 'true') {
      str = `Please Select,${data}`;
    }
    const opt = str.split(widgetRef.current.Seperator);
    return opt;
  };

  const handleOnChange = values => {
    setSelectedValue(values);
  };

  const handleOptionArray = data => {
    const opt = data;
    if (widgetRef.current.Select === 'true') {
      opt.unshift('Please Select');
    }
    opt.map((item, index) => {
      if (Array.isArray(item) || typeof item === 'object') {
        let valueExists = false;
        let labelExists = false;
        const newItem = {};
        if (item.value) {
          valueExists = true;
        }
        if (item.label) {
          labelExists = true;
        }
        if (valueExists || labelExists) {
          // eslint-disable-next-line no-unused-expressions
          valueExists ? newItem.value = item.value : labelExists ? newItem.value = item.label : newItem.key;
          // eslint-disable-next-line no-unused-expressions
          labelExists ? newItem.label = item.label : newItem.value;
          // eslint-disable-next-line no-unused-expressions
          valueExists ? newItem.key = item.value : newItem.label;
        }
        return newItem;
      }
      return {
        key: `undefined-option-type-${index}`,
        value: `undefined-option-type-${index}`,
        label: 'Undefined option type!'
      };
    });
    return opt;
  };

  const createOptionArray = data => {
    var optionArray = [];
    if (typeof (data) === 'string') {
      const opt = handleOptionString(data);
      optionArray.push(...opt);
    } else if (Array.isArray(data)) {
      const opt = handleOptionArray(data);
      optionArray.push(...opt);
    } else {
      optionArray.push({
        key: 'invalid-data-error',
        value: 'invalid-data-error',
        label: 'Invalid data type!'
      });
    }
    return optionArray;
  };

  const handleParameters = parameters => {
    const params = parameters.split(',');
    var uri = widgetRef.current.URL;
    params.forEach(param => {
      uri = uri.replace(new RegExp('#\\w*\\d*'), param);
    }, uri);
    return uri;
  };

  const isUrlParameterized = uri => {
    return uri.search(new RegExp('#\\w*\\d*')) !== -1 || uri.search('Please Select') !== -1;
  };

  const handleUri = () => {
    if (!isUrlParameterized(urlRef.current) && urlRef.current !== '') {
      fetchUrl(urlRef.current).then(data => {
        var selectionArray = [];
        if (!isUrlParameterized(urlRef.current)) {
          selectionArray = createOptionArray(data);
        } else {
          selectionArray = ['Please Select'];
        }
        setOptions(selectionArray);
      });
    } else {
      const selectionArray = [];
      setOptions(selectionArray);
    }
  };

  const isSelection = value => {
    return value.search('select=') !== -1;
  };

  const getSelection = value => {
    return value.match(new RegExp('(?<=(select={1}))([a-z,A-Z,0-9,-]+)'));
  };

  const scriptAlreadyExists = () => document.querySelector('script#JFCustomWidgetScript') !== null;

  const bindScript = () => {
    const script = document.createElement('script');
    script.src = '//js.jotform.com/JotFormCustomWidget.min.js';
    script.id = 'JFCustomWidgetScript';
    script.defer = true;
    script.async = true;
    script.onload = () => setHasLoaded(true);
    document.body.appendChild(script);
  };

  const onWidgetSubmit = () => {
    JFCustomWidget.subscribe('submit', () => {
      var value = selectedRef.current;
      let validation = false;
      if (value !== 'Please Select') {
        validation = true;
      } else {
        validation = false;
        value = '';
      }
      JFCustomWidget.sendSubmit({
        valid: validation,
        value: value
      });
    });
  };

  const setUrlParams = value => {
    var parameters = value;
    var uri = handleParameters(parameters);
    setUrl(uri);
  };

  const onWidgetPopulate = () => {
    JFCustomWidget.subscribe('populate', data => {
      if (isSelection(data.value) === true) {
        const s = getSelection(data.value);
        const m = s[0] ?? null;
        if (m !== null) {
          setSelectedValue(m);
        }
      } else if (widgetRef.current.isParameterized === 'true') {
        setUrlParams(data.value);
      } else {
        setUrl(data.value);
      }
    });
  };

  const onReady = () => {
    // FIXME: open it
    JFCustomWidget.subscribe('ready', details => {
    /* const details = {
      background: 'lightblue'
    }; */
    const settings = JFCustomWidget.getWidgetSettings();
    const u = JFCustomWidget.getWidgetSetting('URL');
    // const u = OPTIONS_API;
    setUrl(u);
    setWidgetSettings(settings);
    setSelectStyle({
      backgroundColor: details.background,
      width: details.width || '%100',
      height: details.height || '%100'
    });
    });
  };

  useEffect(() => {
    if (!scriptAlreadyExists()) {
      bindScript();
    }

    document.getElementById('JFCustomWidgetScript').addEventListener('load', () => {
      onReady();
      onWidgetPopulate();
      onWidgetSubmit();
    });
  }, []);

  useEffect(() => {
    if (url !== undefined) {
      handleUri();
    }
  }, [url]);

  useEffect(() => {
    if (hasLoaded === true) {
      JFCustomWidget.sendData({ value: selectedValue });
    }
  }, [selectedValue]);

  return (
    <>
      <Select
        options={options}
        value={selectedValue}
        onChange={handleOnChange}
        menuPortalTarget={document.body}
      />
    </>
  );
};

export default Widget;

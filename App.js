import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Image } from 'react-native';
import { of, interval, from, defer } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
const log =(msg) => (v) => console.log(msg, " => ",v);
// const obs$ = interval(1000);
const useDebounce = (effect, delay, deps) => {
  const callback = useCallback(effect, deps);
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);
    return () => {
      clearTimeout(handler);
    }
  }, deps)
}
const useObservable = (observable$) => {
  const [state, setState] = useState(0);
  useEffect(() => {
    const subs = observable$.subscribe(setState, err => console.log(err), () => console.log('completed'));
    return () => subs.unsubscribe();
  },[observable$]);
  return state;
};
const obsFunc = (text) => of(text).pipe(
  filter(query => query.trim().length > 0),
  map(log('search text')),
  switchMap(searchTxt => ajax.getJSON(`https://api.github.com/search/users?q=${searchTxt}`)),
  tap(log('query'))
);
let obsText = '';
export default function App() {

  const [text, setText] = useState('');
  useDebounce( () => obsText = text, 500, [text]);
  const memoized$ = useMemo(() => obsFunc(obsText), [obsText])
  const result = useObservable(memoized$)
  // const cVal = useObservable(obs$);
  const onChangeText = (txt) => {
    console.log('text changed')
    setText(txt);
  }
const renderItems = (items) => items.map(item => {
  return (
    <>
      <Text>{item.login}</Text>
      <Image style={styles.tinyLogo} source={{
            uri: item.avatar_url,
          }}
      />
    </>
    );
});
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Autocomplete Search github user</Text>
      {/* <Text>{cVal}</Text> */}
      <TextInput
        value={text}
        onChangeText={onChangeText}
        // style={{height: 40}}
        placeholder="Type here to search!">
      </TextInput>
      <Text>{"\n"}</Text>
      {result && result.items ? renderItems(result.items) : <Text></Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
});

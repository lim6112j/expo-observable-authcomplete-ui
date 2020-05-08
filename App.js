import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { of, interval, from } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
const log =(msg) => (v) => console.log(msg, " => ",v);
const obs$ = interval(1000);
const useObservable = (observable$) => {
  const [state, setState] = useState(0);
  useEffect(() => {
    const subs = observable$.subscribe(setState);
    return () => subs.unsubscribe();
  },[observable$]);
  return state;
};
const obsFunc = (text) => of(text).pipe(
  distinctUntilChanged(),
  filter(query => query.trim().length > 0),
  // switchMap(searchTxt => ajax.getJSON(`https://api.github.com/search/users?q=${searchTxt}`)),
  // switchMap(v => [v]),
  tap(log('query'))
);
export default function App() {
  const [text, setText] = useState('');
  const textval = useObservable(obsFunc(text));
  const cVal = useObservable(obs$);
  const onChangeText = (txt) => {
    // console.log('text => ', txt)
    setText(txt);
  }
  return (
    <View style={styles.container}>
      <Text>Autocomplete Search github user</Text>
      <Text>{cVal}</Text>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        // style={{height: 40}}
        placeholder="Type here to translate!">
      </TextInput>
      <Text>{textval}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

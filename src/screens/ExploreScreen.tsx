import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useAsync } from '../hooks/useAsync';
import { useTheme } from '../hooks/useTheme';

export default function ExploreScreen() {
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const { loading, error, data, run } = useAsync(async () => {
    // Simulate search API response
    await new Promise((r) => setTimeout(r, 800));
    return [
      { title: 'Food', subtitle: 'Restaurants' },
      { title: 'Groceries', subtitle: 'Stores' },
      { title: 'Convenience', subtitle: 'Shops' },
      { title: 'Pharmacy', subtitle: 'Medicines' },
    ];
  }, [query]);

  React.useEffect(() => {
    if (query.length > 0) run();
  }, [query]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header title="Explore" />
      <View style={{ padding: 16 }}>
        <SearchBar placeholder="Search Errandpadi" value={query} onChangeText={setQuery} onSubmit={run} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionHeader title={query ? 'Search results' : 'Popular categories'} />
        {loading && <Loading />}
        {error && <ErrorState message={error.message} />}
        {!loading && !error && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {(data ?? [
              { title: 'Food', subtitle: 'Restaurants' },
              { title: 'Groceries', subtitle: 'Stores' },
              { title: 'Convenience', subtitle: 'Shops' },
              { title: 'Pharmacy', subtitle: 'Medicines' },
            ]).map((c, i) => (
              <Card key={i} title={c.title} subtitle={c.subtitle} />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
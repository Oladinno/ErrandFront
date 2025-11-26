import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../state/store';

type JobDetails = {
  title: string;
  description: string;
  location: string;
  timeRequired: string;
  budget: number | null;
  budgetType: 'hourly' | 'fixed';
  attachments: string[];
};

export default function PostJobScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const addJob = useAppStore((s) => s.addJob);
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [jobDetails, setJobDetails] = React.useState<JobDetails>({ title: '', description: '', location: '', timeRequired: '', budget: null, budgetType: 'hourly', attachments: [] });

  const canNext = () => {
    if (currentStep === 1) return jobDetails.title.trim().length >= 2 && jobDetails.description.trim().length >= 10;
    if (currentStep === 2) return jobDetails.location.trim().length >= 2 && jobDetails.timeRequired.trim().length >= 2;
    if (currentStep === 3) return typeof jobDetails.budget === 'number' && jobDetails.budget > 0;
    if (currentStep === 4) return true;
    return false;
  };

  const onPost = () => {
    const id = `j${Date.now()}`;
    console.log('Posting job', jobDetails);
    addJob({ id, title: jobDetails.title, category: 'General', status: 'active', description: jobDetails.description, budget: jobDetails.budget ?? undefined, budgetType: jobDetails.budgetType, location: jobDetails.location, timeRequired: jobDetails.timeRequired, attachments: jobDetails.attachments });
    navigation.getParent()?.navigate('App', { screen: 'JobPosted', params: { jobId: id } });
  };

  const Header = (
    <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
      <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back" style={{ padding: 8 }}>
        <Feather name="chevron-left" size={20} color={theme.colors.textPrimary} />
      </Pressable>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Post a Job</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ color: theme.colors.textSecondary }}>{currentStep}/4</Text>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Close" style={{ padding: 8 }}>
          <Feather name="x" size={18} color={theme.colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  const Step1 = (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={styles.label}>Title</Text>
      <TextInput placeholder="Enter title here..." placeholderTextColor={theme.colors.textSecondary} value={jobDetails.title} onChangeText={(v) => setJobDetails((s) => ({ ...s, title: v }))} style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.label}>Description</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{Math.min(300, jobDetails.description.length)}/300</Text>
      </View>
      <TextInput multiline numberOfLines={5} maxLength={300} placeholder="Enter description here..." placeholderTextColor={theme.colors.textSecondary} value={jobDetails.description} onChangeText={(v) => setJobDetails((s) => ({ ...s, description: v }))} style={[styles.textArea, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
    </View>
  );

  const Step2 = (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={styles.label}>Location</Text>
      <View style={[styles.inputRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
        <TextInput placeholder="Search and choose locations" placeholderTextColor={theme.colors.textSecondary} value={jobDetails.location} onChangeText={(v) => setJobDetails((s) => ({ ...s, location: v }))} style={[styles.inputBare, { color: theme.colors.textPrimary }]} />
      </View>
      {!!jobDetails.location && jobDetails.location.toLowerCase().startsWith('s') && (
        <Pressable onPress={() => setJobDetails((s) => ({ ...s, location: 'Sagamu' }))} style={{ paddingVertical: 10 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Suggest: Sagamu</Text>
        </Pressable>
      )}
      <Text style={styles.label}>Time Required</Text>
      <TextInput placeholder="e.g. 1 hour, 3 hours" placeholderTextColor={theme.colors.textSecondary} value={jobDetails.timeRequired} onChangeText={(v) => setJobDetails((s) => ({ ...s, timeRequired: v }))} style={[styles.input, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
    </View>
  );

  const Step3 = (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={styles.label}>Budget</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TextInput keyboardType="numeric" placeholder="₦" placeholderTextColor={theme.colors.textSecondary} value={jobDetails.budget?.toString() ?? ''} onChangeText={(v) => setJobDetails((s) => ({ ...s, budget: Number(v.replace(/[^0-9]/g, '')) || null }))} style={[styles.input, { flex: 1, color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={() => setJobDetails((s) => ({ ...s, budgetType: 'hourly' }))} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: jobDetails.budgetType === 'hourly' ? theme.colors.card : theme.colors.background }]}>
          <Text style={{ color: jobDetails.budgetType === 'hourly' ? theme.colors.textPrimary : theme.colors.textSecondary }}>Hourly</Text>
        </Pressable>
        <Pressable onPress={() => setJobDetails((s) => ({ ...s, budgetType: 'fixed' }))} style={[styles.pill, { borderColor: theme.colors.border, backgroundColor: jobDetails.budgetType === 'fixed' ? theme.colors.card : theme.colors.background }]}>
          <Text style={{ color: jobDetails.budgetType === 'fixed' ? theme.colors.textPrimary : theme.colors.textSecondary }}>Fixed</Text>
        </Pressable>
      </View>
    </View>
  );

  const Step4 = (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={styles.label}>Attachments</Text>
      <Pressable onPress={() => setJobDetails((s) => ({ ...s, attachments: [...s.attachments, 'https://picsum.photos/id/1045/200/200'] }))} style={[styles.uploadBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
        <Text style={{ color: theme.colors.textSecondary }}>Tap to upload a file, image or video</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {jobDetails.attachments.map((src, i) => (
          <View key={`${src}-${i}`} style={{ position: 'relative' }}>
            <Image source={{ uri: src }} style={styles.thumb} />
            <Pressable onPress={() => setJobDetails((s) => ({ ...s, attachments: s.attachments.filter((_, idx) => idx !== i) }))} style={styles.deleteBadge} accessibilityLabel="Remove">
              <Feather name="x" size={16} color={'#fff'} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const Content = currentStep === 1 ? Step1 : currentStep === 2 ? Step2 : currentStep === 3 ? Step3 : Step4;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {Header}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>{Content}</ScrollView>
      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}> 
        {currentStep > 1 && (
          <Pressable onPress={() => setCurrentStep((s) => Math.max(1, s - 1))} accessibilityLabel="Back" style={[styles.backBtn, { borderColor: theme.colors.border }]}> 
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => (currentStep === 4 ? onPost() : setCurrentStep((s) => Math.min(4, s + 1)))}
          accessibilityLabel={currentStep === 4 ? 'Post Job' : 'Next'}
          disabled={!canNext()}
          style={[styles.nextBtn, { backgroundColor: canNext() ? theme.colors.accent : theme.colors.border }]}
        >
          <Text style={{ color: canNext() ? '#fff' : theme.colors.textSecondary, fontWeight: '700' }}>{currentStep === 4 ? 'Post Job' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  label: { color: '#6B7280', fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, minHeight: 120 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputBare: { flex: 1 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 16 },
  uploadBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 14, alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 10 },
  deleteBadge: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  nextBtn: { flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
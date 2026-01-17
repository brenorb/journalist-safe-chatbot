import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [serverUrl, setServerUrl] = useState('http://localhost:8787');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama-3.3-70b');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: makeId(),
      role: 'assistant',
      content:
        'Hi. I can help with a quick check-in, grounding, or debrief. What do you need right now?',
    },
  ]);

  const apiBase = useMemo(() => serverUrl.replace(/\/$/, ''), [serverUrl]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!apiKey.trim()) {
      Alert.alert('Missing API key', 'Set your Maple API key first.');
      return;
    }

    setSending(true);

    const userMessage = { id: makeId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch(`${apiBase}/api/text`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-maple-api-key': apiKey.trim(),
          'x-maple-model': model.trim() || 'llama-3.3-70b',
        },
        body: JSON.stringify({
          stream: false,
          messages: [
            {
              role: 'system',
              content:
                'You are a supportive mental health chatbot for journalists. Be concise, practical, and avoid graphic trauma details. If the user is in immediate danger or mentions self-harm, encourage contacting local emergency services and show crisis resources.',
            },
            ...messages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: trimmed },
          ],
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${t}`);
      }

      const json = await res.json();
      const assistantText = json?.text ?? '';

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'assistant', content: assistantText || '(empty)' },
      ]);
    } catch (e) {
      Alert.alert('Request failed', e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chatbot Test</Text>
          <Text style={styles.subtitle}>Text-only (MVP) via /api/text</Text>
        </View>

        <View style={styles.settings}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://YOUR_IP:8787"
          />
          <Text style={styles.hint}>
            On device, use your laptop IP (not localhost).
          </Text>

          <Text style={styles.label}>Maple API key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="sk-..."
            secureTextEntry
          />

          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="llama-3.3-70b"
          />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chat}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleRole,
                  item.role === 'user' ? styles.userRole : styles.assistantRole,
                ]}
              >
                {item.role === 'user' ? 'You' : 'Assistant'}
              </Text>
              <Text
                style={[
                  styles.bubbleText,
                  item.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            style={[styles.input, styles.composerInput]}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            editable={!sending}
          />
          <Pressable
            style={[styles.sendBtn, sending ? styles.sendBtnDisabled : null]}
            onPress={() => send()}
            disabled={sending}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : 'Send'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  settings: { paddingHorizontal: 16, paddingBottom: 8 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  hint: { fontSize: 11, color: '#666', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chat: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  bubble: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#111' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#f6f6f6' },
  bubbleRole: { fontSize: 11, opacity: 0.8 },
  userRole: { color: '#ccc' },
  assistantRole: { color: '#777' },
  bubbleText: { marginTop: 6, fontSize: 14 },
  userText: { color: '#fff' },
  assistantText: { color: '#111' },
  composer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  composerInput: { flex: 1 },
  sendBtn: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#111',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: '700' },
});

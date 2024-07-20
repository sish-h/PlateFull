import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import StatusBar from '../../components/common/StatusBar';
import { colors } from '../../constants/colors';
import { shadowPresets } from '../../utils/shadowUtils';

const { width } = Dimensions.get('window');

const ChildProfileScreen = ({ navigation }) => {
  const [children, setChildren] = useState([
    {
      id: 1,
      name: 'Johnny',
      age: '4yrs',
      avatar: null,
      hasPhoto: true
    }
  ]);
  const [selectedChild, setSelectedChild] = useState(0);

  const handleAddPhoto = async (childId) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const updatedChildren = children.map(child => 
        child.id === childId 
          ? { ...child, avatar: result.assets[0].uri, hasPhoto: true }
          : child
      );
      setChildren(updatedChildren);
    }
  };

  const handleAddNewChild = () => {
    if (navigation) {
      navigation.navigate('profile/setup', { isNewChild: true });
    }
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Profile Card */}
        <Animated.View 
          entering={FadeInUp.delay(100)}
          style={[styles.profileCard, animatedStyle]}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.sectionTitle}>My Child</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.childInfo}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => handleAddPhoto(children[selectedChild].id)}
            >
              {children[selectedChild].hasPhoto && children[selectedChild].avatar ? (
                <Image 
                  source={{ uri: children[selectedChild].avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Image 
                    source={require('../../assets/images/avatars/boy_avatar.png')}
                    style={styles.avatar}
                  />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.childDetails}>
              <Text style={styles.childName}>{children[selectedChild].name}</Text>
              <Text style={styles.childAge}>{children[selectedChild].age}</Text>
              
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progress</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
                <Text style={styles.progressText}>65% Complete</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View 
          entering={FadeInUp.delay(200)}
          style={styles.statsContainer}
        >
          <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="restaurant" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Meals Logged</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="leaf" size={24} color={colors.food.vegetables} />
              </View>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>New Foods</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={24} color={colors.gamification.gold} />
              </View>
              <Text style={styles.statNumber}>450</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.delay(300)}
          style={styles.actionsContainer}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="fast-food" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Log a Meal</Text>
                <Text style={styles.actionSubtitle}>Track what your child ate</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={24} color={colors.food.fruits} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Add New Food</Text>
                <Text style={styles.actionSubtitle}>Introduce something new</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Ionicons name="bar-chart" size={24} color={colors.food.proteins} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Progress</Text>
                <Text style={styles.actionSubtitle}>Check nutrition insights</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Add Child Button */}
        <Animated.View 
          entering={FadeInUp.delay(400)}
          style={styles.addChildContainer}
        >
          <TouchableOpacity 
            style={styles.addChildButton}
            onPress={handleAddNewChild}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
            <Text style={styles.addChildText}>Add Another Child</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: -10,
    marginBottom: 20,
    ...shadowPresets.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
    ...shadowPresets.small,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  childAge: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadowPresets.small,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsList: {
    marginTop: 16,
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    ...shadowPresets.small,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  addChildContainer: {
    marginBottom: 30,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    ...shadowPresets.small,
  },
  addChildText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ChildProfileScreen;
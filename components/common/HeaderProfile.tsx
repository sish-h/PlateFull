import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface HeaderProfileProps {
  name: string;
  avatar: ImageSourcePropType;
  isPremium?: boolean;
  showChargeIcon?: boolean;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({
  name,
  avatar,
  isPremium = true,
  showChargeIcon = true
}) => {
  return (
    <View style={styles.headerProfile}>
      <View style={styles.profileInfo}>
        <View style={styles.profileAvatar}>
          <Image source={avatar} style={styles.avatarImage} />
        </View>
        <View>
          <Text style={styles.profileName}>{name}</Text>
          {isPremium && (
            <Text style={styles.profileStatus}>
              <Image source={require('../../assets/images/icons/premium.svg')} style={styles.premiumIcon} />
              Premium
            </Text>
          )}
        </View>
      </View>
      {showChargeIcon && (
        <View style={styles.chargeIconContainer}>
          <Image source={require('../../assets/images/icons/charge.svg')} style={styles.chargeIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  profileStatus: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  premiumIcon: {
    width: 19,
    height: 19,
    marginRight: 5,
    marginTop: 5,
    marginBottom: -5,
  },
  chargeIconContainer: {
    width: 110,
    height: 38,
    justifyContent: 'center',
  },
  chargeIcon: {
    width: 110,
    height: 38,
    justifyContent: 'center',
  },
});

export default HeaderProfile; 
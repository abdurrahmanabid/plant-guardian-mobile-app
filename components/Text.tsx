import React from 'react';
import { Text as T, View } from 'react-native';
interface TextProps{
  className?:string,
  children:string
}
const Text = ({className='',children}:TextProps) => {
  console.log(className.toLowerCase());
  
  return (
    <View>
      <T className={`${className.toLowerCase()}`} style={{color:'white'}}>{children}</T>
    </View>
  )
}

export default Text

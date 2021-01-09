import React from 'react';
import { createAnimation } from '@ionic/react';
// import './AnimationDemo.css';


export function simpleAnimation(el) {
    if (el) {
        const animation = createAnimation()
            .addElement(el)
            .duration(1000)
            .direction('alternate')
            .iterations(Infinity)
            .keyframes([
                { offset: 0, transform: 'scale(1)', opacity: '1' },
                {
                    offset: 1, transform: 'scale(0.75)', opacity: '0.5'
                }
            ]);
        animation.play();
    }
}

export function groupAnimations(elB, elC) {
    if (elB && elC) {
        const animationA = createAnimation()
            .addElement(elB)
            .fromTo('transform', 'scale(1)', 'scale(1.25)');
        const animationB = createAnimation()
            .addElement(elC)
            .fromTo('transform', 'scale(1)', 'scale(0.75)');
        const parentAnimation = createAnimation()
            .duration(10000)
            .addAnimation([animationA, animationB]);
        parentAnimation.play();    }
}

export function chainAnimations(elB, elC) {
    if (elB && elC) {
        const animationA = createAnimation()
            .addElement(elB)
            .duration(3000)
            .fromTo('transform', 'translateX(100px)', 'translateX(0)');
        const animationB = createAnimation()
            .addElement(elC)
            .duration(3000)
            .fromTo('transform', 'translateX(300px)', 'translateX(0)');
        (async () => {
            await animationA.play();
            await animationB.play();
        })();
    }
}


export interface IGuideData {
  showContext: boolean;
  showSubtasks: boolean;
}

export interface IGuideTransitions {
  toggleContext: () => IGuide;
  toggleSubtasks: () => IGuide;
}

export interface IGuide extends IGuideData, IGuideTransitions {}

export function createGuide(guideData: Readonly<IGuideData>): IGuide {
  const toggleContext = (): IGuide => {
    return createGuide({
      ...guideData,
      showContext: !guideData.showContext,
    });
  };
  const toggleSubtasks = (): IGuide => {
    return createGuide({
      ...guideData,
      showSubtasks: !guideData.showSubtasks,
    });
  };
  return { ...guideData, toggleContext, toggleSubtasks };
}
